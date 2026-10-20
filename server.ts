import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limit for multiple architectural drawings & CAD files
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Server-side Gemini client initialization with mandatory user-agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Drawing & CAD Measurement Extraction Endpoint (Single or Multiple Drawings)
app.post('/api/ai/extract-measurements', async (req, res) => {
  try {
    const { files, imageBase64, mimeType, cadText, fileName, userNotes } = req.body;

    // Normalize files into an array of drawing files
    const drawingFiles: {
      name: string;
      imageBase64?: string;
      mimeType?: string;
      cadText?: string;
    }[] = [];

    if (Array.isArray(files) && files.length > 0) {
      files.forEach((f, idx) => {
        drawingFiles.push({
          name: f.name || `Drawing Sheet ${idx + 1}`,
          imageBase64: f.imageBase64,
          mimeType: f.mimeType || 'image/png',
          cadText: f.cadText,
        });
      });
    } else if (imageBase64 || cadText) {
      drawingFiles.push({
        name: fileName || 'Uploaded Drawing',
        imageBase64,
        mimeType: mimeType || 'image/png',
        cadText,
      });
    }

    if (drawingFiles.length === 0) {
      return res.status(400).json({
        error: 'Please provide at least one drawing image or CAD DXF file.',
      });
    }

    const systemInstruction = `You are an expert Senior Quantity Surveyor and Civil/Structural Estimating Engineer.
Your task is to thoroughly analyze one or more architectural floor plans, structural drawings, CAD layouts, sections, rebar schedules, or detail drawings (provided as images or CAD/DXF data), and extract accurate take-off measurements and quantities for a standardized Bill of Quantities (BOQ).

When multiple drawing sheets are provided:
- Cross-reference drawings where applicable (e.g. plan dimensions with section depths/heights).
- Extract distinct elements across each sheet (foundations, columns, beams, walls, slabs, finishes, doors/windows, rebar).
- Clearly indicate the source drawing sheet for each measurement in 'sourceDrawing'.

BOQ Standard Codes Reference:
- Section A: Sub-Structure
  1.1: Site clearing / over site excavation (m²)
  1.2: Bulk excavation in ordinary soil (m³)
  1.3: Trench excavation for stone masonry wall (m³)
  1.4: Pit excavation for isolated footing pads (m³)
  1.5: Backfill under hardcore / around foundations (m³)
  1.6: Cart away surplus excavated material (m³)
  1.7: Basaltic stone hardcore 25cm thick (m²)
  2.1a: Lean concrete C-5 under footing pads (m²)
  2.1b: Lean concrete C-5 under masonry & grade beams (m²)
  2.1c: Lean concrete C-5 under hardcore (m²)
  2.2a: Reinforced concrete C-25 for footing pads (m³)
  2.2b: Reinforced concrete C-25 for foundation columns (m³)
  2.2c: Reinforced concrete C-25 for grade beams (m³)
  2.2d: 10cm ground floor slab (m²)
  2.4a: Formwork for footing pads (m²)
  2.4b: Formwork for foundation columns (m²)
  2.4c: Formwork for grade beams (m²)
  2.5a: 8mm rebar (kg)
  2.5b: 14mm rebar (kg)
  2.5c: 16mm rebar (kg)
  2.5d: 20mm rebar (kg)
  3.1: Stone masonry foundation wall below NGL (m³)
  3.2: Stone masonry wall above NGL (m³)

- Section B: Super-Structure
  1.1a: Elevation columns RC C-25 (m³)
  1.1b: Intermediate & top tie beams RC C-25 (m³)
  1.1c: 15cm solid slab RC C-25 (m³)
  1.1d: Staircase & landing RC C-25 (m³)
  1.2a: Formwork for elevation columns (m²)
  1.2b: Formwork for beams (m²)
  1.2c: Formwork for slabs (m²)
  1.2d: Formwork for stairs (m²)
  1.3a: 8mm rebar (kg)
  1.3b: 10mm rebar (kg)
  1.3c: 12mm rebar (kg)
  1.3d: 14mm rebar (kg)
  1.3e: 16mm rebar (kg)
  2.1: 20cm HCB wall (m²)
  2.2: 15cm HCB wall (m²)
  3.1: CIS C-30 roof cover (m²)
  3.2: G-30 metal gutter (ml)
  3.3: Down pipes (ml)
  4.1a-c: Timber trusses & purlins (ml)
  4.2: Wooden doors (pcs)
  5.1a-d: Steel tubular doors (pcs)
  5.2: Steel windows (pcs)
  5.3a-c: Balustrades (kg)
  6.1: Internal plaster 3-coat (m²)
  6.2: External plaster (m²)
  6.3: Ceiling / slab plaster (m²)
  6.8: Ceramic floor tile (m²)
  6.9: Wall tile (m²)
  6.10: Terrazzo tile (m²)
  6.11: Tile skirting (ml)
  7.1: Glazing (m²)
  8.1-8.6: Painting works (m²)
  9.1-9.15: Sanitary fixtures and piping
  10.1-10.13: Electrical points & distribution boards

- Section C: Ancillary Structures
  Septic tanks, manholes, compound fences, guard rooms, stormwater drainage.

Instructions:
1. Examine all grid lines, dimension lines, elevation tags, callouts, text notes, schedule tables, member labels (e.g., F1, C1, GB1, B1, S1, W1, D1), and reinforcement notation across all uploaded sheets.
2. For each identified architectural/structural element:
   - Identify the element name and exact dimensions (Length, Width, Height/Depth, Thickness, Diameter).
   - Count the quantity of members visible or noted.
   - Calculate the resulting take-off quantity (volume in m³ = count × L × W × H; area in m² = count × L × W; linear length in ml = count × L; count in pcs; or rebar weight in kg).
   - Map it to the most appropriate BOQ item code from the standard list above (e.g. 2.2a, 1.1a, 2.1, etc.).
   - Include specific location or axis notes and the source sheet name.
   - For reinforcement rebar, extract bar diameter (in mm), length per bar, number of bars per member, and member count.`;

    const promptText = `Analyze these ${drawingFiles.length} architectural/structural drawing sheet(s) (${drawingFiles.map((d) => d.name).join(', ')}).
${userNotes ? `User instructions / focus area: ${userNotes}` : 'Extract all measurable structural, architectural, concrete, masonry, rebar, opening, and finishing quantities across all sheets.'}
Extract the key drawing details and a comprehensive list of take-off items mapped to standard BOQ items.`;

    const contents: any[] = [];

    // Add each drawing sheet into the multimodal prompt
    drawingFiles.forEach((file, idx) => {
      contents.push({
        text: `--- DRAWING SHEET ${idx + 1} OF ${drawingFiles.length}: "${file.name}" ---`,
      });

      if (file.imageBase64) {
        contents.push({
          inlineData: {
            mimeType: file.mimeType || 'image/png',
            data: file.imageBase64,
          },
        });
      }

      if (file.cadText) {
        contents.push({
          text: `CAD / DXF File Data Content for ${file.name}:\n${file.cadText.slice(0, 150000)}`,
        });
      }
    });

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drawingTitle: {
              type: Type.STRING,
              description: 'Title or summary of the drawing set (e.g. G+2 Architectural & Foundation Drawing Set)',
            },
            drawingType: {
              type: Type.STRING,
              description: 'Category: multi_sheet_set, foundation, floor_plan, structural, rebar_schedule, etc.',
            },
            detectedScale: {
              type: Type.STRING,
              description: 'Scale detected on drawings, e.g. 1:50, 1:100, or dimensions in meters/cm',
            },
            generalNotes: {
              type: Type.STRING,
              description: 'Summary of the structural system, sheets reviewed, grid dimensions, and major observations',
            },
            extractedItems: {
              type: Type.ARRAY,
              description: 'List of take-off measurement items extracted across all drawings',
              items: {
                type: Type.OBJECT,
                properties: {
                  elementTag: {
                    type: Type.STRING,
                    description: 'Label on drawing (e.g. Footing F1, Column C1, HCB Wall W-01, Grade Beam GB-1, Rebar 4Ø16)',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Full description of the element including dimensions (e.g. 1.80m x 1.80m x 0.50m Isolated Footing Pad)',
                  },
                  sourceDrawing: {
                    type: Type.STRING,
                    description: 'Name or index of the source drawing sheet (e.g. Sheet 1: Foundation Plan)',
                  },
                  suggestedBoqCode: {
                    type: Type.STRING,
                    description: 'Matching BOQ item code from standard list (e.g. 2.2a, 1.4, 2.2b, 1.1a, 2.1, 2.5c, 6.1, etc.)',
                  },
                  suggestedBoqSection: {
                    type: Type.STRING,
                    description: 'Target BOQ section: A (Substructure), B (Superstructure), or ANC (Ancillary)',
                  },
                  unit: {
                    type: Type.STRING,
                    description: 'm³, m², ml, kg, or pcs',
                  },
                  count: {
                    type: Type.NUMBER,
                    description: 'Number of identical elements (No.)',
                  },
                  length: {
                    type: Type.NUMBER,
                    description: 'Length in meters',
                  },
                  width: {
                    type: Type.NUMBER,
                    description: 'Width in meters (if applicable)',
                  },
                  height: {
                    type: Type.NUMBER,
                    description: 'Height / depth / thickness in meters (if applicable)',
                  },
                  calculatedQuantity: {
                    type: Type.NUMBER,
                    description: 'Total quantity computed for this item',
                  },
                  barDiameterMm: {
                    type: Type.NUMBER,
                    description: 'For rebar: bar diameter in mm (e.g. 8, 10, 12, 14, 16, 20)',
                  },
                  barLengthM: {
                    type: Type.NUMBER,
                    description: 'For rebar: cut length per bar in meters',
                  },
                  barCountPerMember: {
                    type: Type.NUMBER,
                    description: 'For rebar: number of bars per structural member',
                  },
                  memberCount: {
                    type: Type.NUMBER,
                    description: 'For rebar: number of structural members',
                  },
                  confidence: {
                    type: Type.STRING,
                    description: 'high, medium, or low',
                  },
                  notes: {
                    type: Type.STRING,
                    description: 'Specific location, grid coordinates, or calculation notes',
                  },
                },
                required: ['elementTag', 'description', 'unit', 'calculatedQuantity', 'suggestedBoqCode'],
              },
            },
          },
          required: ['drawingTitle', 'drawingType', 'extractedItems'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error during AI measurement extraction:', err);
    return res.status(500).json({
      error: err.message || 'Failed to extract measurements from drawing(s).',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
