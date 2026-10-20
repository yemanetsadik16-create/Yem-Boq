export interface SampleCADDrawing {
  id: string;
  title: string;
  type: string;
  description: string;
  svgDataUri: string;
  notes: string;
}

// High-fidelity blueprint SVG for Foundation & Footing Plan
const FOUNDATION_PLAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#0F2C4C; font-family:'IBM Plex Mono',monospace;">
  <!-- Background Blueprint Grid -->
  <defs>
    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#173E66" stroke-width="0.5"/>
    </pattern>
    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="url(#smallGrid)"/>
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#205080" stroke-width="1.2"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="#0A2038"/>
  <rect width="800" height="600" fill="url(#grid)"/>

  <!-- Border & Title Block in Drawing -->
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="#E3A008" stroke-width="2"/>
  <rect x="520" y="470" width="255" height="105" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="535" y="495" fill="#E3A008" font-size="12" font-weight="bold">PROJECT: G+2 MICRO CLUSTER</text>
  <text x="535" y="515" fill="#FFFFFF" font-size="11">DRAWING: FOUNDATION &amp; FOOTING PLAN</text>
  <text x="535" y="533" fill="#A9BCCD" font-size="10">SCALE: 1:50 | UNITS: METERS</text>
  <text x="535" y="552" fill="#A9BCCD" font-size="10">FOOTING PAD: C-25 RC (DEPTH 0.50m)</text>
  <text x="535" y="567" fill="#2F7D5B" font-size="10" font-weight="bold">REBAR: Ø16mm @ 150mm c/c</text>

  <!-- Grid Lines (Axes A, B, C & 1, 2, 3) -->
  <!-- Horizontal Axes -->
  <line x1="100" y1="160" x2="680" y2="160" stroke="#7A8A9B" stroke-dasharray="8,4" stroke-width="1.5"/>
  <circle cx="90" cy="160" r="14" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="86" y="165" fill="#E3A008" font-size="13" font-weight="bold">A</text>

  <line x1="100" y1="310" x2="680" y2="310" stroke="#7A8A9B" stroke-dasharray="8,4" stroke-width="1.5"/>
  <circle cx="90" cy="310" r="14" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="86" y="315" fill="#E3A008" font-size="13" font-weight="bold">B</text>

  <line x1="100" y1="450" x2="680" y2="450" stroke="#7A8A9B" stroke-dasharray="8,4" stroke-width="1.5"/>
  <circle cx="90" cy="450" r="14" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="86" y="455" fill="#E3A008" font-size="13" font-weight="bold">C</text>

  <!-- Vertical Axes -->
  <line x1="190" y1="80" x2="190" y2="520" stroke="#7A8A9B" stroke-dasharray="8,4" stroke-width="1.5"/>
  <circle cx="190" cy="70" r="14" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="186" y="75" fill="#E3A008" font-size="13" font-weight="bold">1</text>

  <line x1="360" y1="80" x2="360" y2="520" stroke="#7A8A9B" stroke-dasharray="8,4" stroke-width="1.5"/>
  <circle cx="360" cy="70" r="14" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="356" y="75" fill="#E3A008" font-size="13" font-weight="bold">2</text>

  <line x1="530" y1="80" x2="530" y2="520" stroke="#7A8A9B" stroke-dasharray="8,4" stroke-width="1.5"/>
  <circle cx="530" cy="70" r="14" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="526" y="75" fill="#E3A008" font-size="13" font-weight="bold">3</text>

  <!-- Dimension Strings -->
  <!-- Horizontal Dim 1 to 2 = 5.00m -->
  <line x1="190" y1="110" x2="360" y2="110" stroke="#38BDF8" stroke-width="1.2"/>
  <line x1="190" y1="105" x2="190" y2="115" stroke="#38BDF8" stroke-width="1.2"/>
  <line x1="360" y1="105" x2="360" y2="115" stroke="#38BDF8" stroke-width="1.2"/>
  <text x="255" y="105" fill="#38BDF8" font-size="11">5.00 m</text>

  <!-- Horizontal Dim 2 to 3 = 5.00m -->
  <line x1="360" y1="110" x2="530" y2="110" stroke="#38BDF8" stroke-width="1.2"/>
  <line x1="530" y1="105" x2="530" y2="115" stroke="#38BDF8" stroke-width="1.2"/>
  <text x="425" y="105" fill="#38BDF8" font-size="11">5.00 m</text>

  <!-- Vertical Dim A to B = 4.50m -->
  <line x1="140" y1="160" x2="140" y2="310" stroke="#38BDF8" stroke-width="1.2"/>
  <line x1="135" y1="160" x2="145" y2="160" stroke="#38BDF8" stroke-width="1.2"/>
  <line x1="135" y1="310" x2="145" y2="310" stroke="#38BDF8" stroke-width="1.2"/>
  <text x="95" y="240" fill="#38BDF8" font-size="11" transform="rotate(-90 95,240)">4.50 m</text>

  <!-- Vertical Dim B to C = 4.20m -->
  <line x1="140" y1="310" x2="140" y2="450" stroke="#38BDF8" stroke-width="1.2"/>
  <line x1="135" y1="450" x2="145" y2="450" stroke="#38BDF8" stroke-width="1.2"/>
  <text x="95" y="385" fill="#38BDF8" font-size="11" transform="rotate(-90 95,385)">4.20 m</text>

  <!-- Grade Beams Connecting Footings (GB1: 25cm x 40cm) -->
  <line x1="190" y1="160" x2="530" y2="160" stroke="#0284C7" stroke-width="8" stroke-opacity="0.8"/>
  <line x1="190" y1="310" x2="530" y2="310" stroke="#0284C7" stroke-width="8" stroke-opacity="0.8"/>
  <line x1="190" y1="450" x2="530" y2="450" stroke="#0284C7" stroke-width="8" stroke-opacity="0.8"/>
  <line x1="190" y1="160" x2="190" y2="450" stroke="#0284C7" stroke-width="8" stroke-opacity="0.8"/>
  <line x1="360" y1="160" x2="360" y2="450" stroke="#0284C7" stroke-width="8" stroke-opacity="0.8"/>
  <line x1="530" y1="160" x2="530" y2="450" stroke="#0284C7" stroke-width="8" stroke-opacity="0.8"/>

  <!-- 6 Isolated Footing Pads (F1: 1.80m x 1.80m x 0.50m) at corners and perimeter -->
  <!-- A-1 -->
  <rect x="150" y="120" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="180" y="150" width="20" height="20" fill="#E3A008"/>
  <text x="155" y="140" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- A-2 -->
  <rect x="320" y="120" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="350" y="150" width="20" height="20" fill="#E3A008"/>
  <text x="325" y="140" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- A-3 -->
  <rect x="490" y="120" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="520" y="150" width="20" height="20" fill="#E3A008"/>
  <text x="495" y="140" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- B-1 -->
  <rect x="150" y="270" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="180" y="300" width="20" height="20" fill="#E3A008"/>
  <text x="155" y="290" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- B-2 -->
  <rect x="315" y="265" width="90" height="90" fill="#164E63" stroke="#F59E0B" stroke-width="2"/>
  <rect x="348" y="298" width="24" height="24" fill="#E3A008"/>
  <text x="320" y="285" fill="#F59E0B" font-size="10" font-weight="bold">F2 (2.0x2.0)</text>

  <!-- B-3 -->
  <rect x="490" y="270" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="520" y="300" width="20" height="20" fill="#E3A008"/>
  <text x="495" y="290" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- C-1 -->
  <rect x="150" y="410" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="180" y="440" width="20" height="20" fill="#E3A008"/>
  <text x="155" y="430" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- C-2 -->
  <rect x="320" y="410" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="350" y="440" width="20" height="20" fill="#E3A008"/>
  <text x="325" y="430" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- C-3 -->
  <rect x="490" y="410" width="80" height="80" fill="#1E3A5F" stroke="#38BDF8" stroke-width="1.8"/>
  <rect x="520" y="440" width="20" height="20" fill="#E3A008"/>
  <text x="495" y="430" fill="#38BDF8" font-size="10" font-weight="bold">F1 (1.8x1.8)</text>

  <!-- Annotation callout -->
  <line x1="230" y1="130" x2="280" y2="80" stroke="#E3A008" stroke-width="1.2"/>
  <text x="270" y="70" fill="#E3A008" font-size="11" font-weight="bold">8 No. F1 Footing Pads (1.80 x 1.80 x 0.50m)</text>
  <text x="270" y="85" fill="#FFFFFF" font-size="10">1 No. F2 Central Pad (2.00 x 2.00 x 0.50m)</text>
  <text x="270" y="100" fill="#A9BCCD" font-size="10">Grade Beam GB1 (25 x 40cm, Total L=57.4m)</text>
</svg>`;

// Architectural Floor Plan SVG
const FLOOR_PLAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#0F2C4C; font-family:'IBM Plex Mono',monospace;">
  <rect width="800" height="600" fill="#0A2038"/>
  <!-- Border -->
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="#E3A008" stroke-width="2"/>
  <rect x="520" y="470" width="255" height="105" fill="#0F2C4C" stroke="#E3A008" stroke-width="1.5"/>
  <text x="535" y="495" fill="#E3A008" font-size="12" font-weight="bold">PROJECT: G+2 MICRO CLUSTER</text>
  <text x="535" y="515" fill="#FFFFFF" font-size="11">DRAWING: GROUND FLOOR ARCHITECTURAL</text>
  <text x="535" y="533" fill="#A9BCCD" font-size="10">EXTERNAL WALLS: 20cm HCB (Mix 1:3)</text>
  <text x="535" y="552" fill="#A9BCCD" font-size="10">INTERNAL WALLS: 15cm HCB (Mix 1:3)</text>
  <text x="535" y="567" fill="#2F7D5B" font-size="10" font-weight="bold">SLAB THICKNESS: 15cm RC C-25</text>

  <!-- External Walls (20cm HCB) -->
  <rect x="120" y="120" width="480" height="360" fill="none" stroke="#38BDF8" stroke-width="12"/>
  <text x="310" y="105" fill="#38BDF8" font-size="11" font-weight="bold">20cm HCB External Wall (L=12.0m)</text>
  <text x="50" y="300" fill="#38BDF8" font-size="11" font-weight="bold" transform="rotate(-90 50,300)">20cm HCB External Wall (L=9.0m)</text>

  <!-- Internal Partition (15cm HCB) -->
  <line x1="360" y1="120" x2="360" y2="480" stroke="#F59E0B" stroke-width="8"/>
  <line x1="120" y1="300" x2="360" y2="300" stroke="#F59E0B" stroke-width="8"/>

  <!-- Rooms labels -->
  <text x="180" y="210" fill="#FFFFFF" font-size="14" font-weight="bold">OFFICE / LIVING</text>
  <text x="180" y="230" fill="#A9BCCD" font-size="11">Area: 25.2 m²</text>
  <text x="180" y="248" fill="#E3A008" font-size="10">Floor: 30x30 Ceramic Tile</text>

  <text x="180" y="380" fill="#FFFFFF" font-size="14" font-weight="bold">CONFERENCE ROOM</text>
  <text x="180" y="400" fill="#A9BCCD" font-size="11">Area: 24.5 m²</text>
  <text x="180" y="418" fill="#E3A008" font-size="10">Floor: Terrazzo Tile</text>

  <text x="420" y="290" fill="#FFFFFF" font-size="14" font-weight="bold">WORKSTATION HALL</text>
  <text x="420" y="310" fill="#A9BCCD" font-size="11">Area: 54.0 m²</text>
  <text x="420" y="328" fill="#E3A008" font-size="10">Floor: 30x30 Ceramic Tile</text>

  <!-- Door openings (D1: 90x210cm) -->
  <line x1="220" y1="300" x2="260" y2="300" stroke="#0F2C4C" stroke-width="10"/>
  <path d="M 220 300 A 40 40 0 0 1 260 260" fill="none" stroke="#E3A008" stroke-width="1.5"/>
  <text x="210" y="285" fill="#E3A008" font-size="10">D1 (90x210)</text>

  <!-- Windows (W1: 150x120cm) -->
  <rect x="200" y="115" width="60" height="10" fill="#E0F2FE" stroke="#0284C7"/>
  <text x="210" y="105" fill="#E0F2FE" font-size="10">W1</text>
  <rect x="420" y="115" width="80" height="10" fill="#E0F2FE" stroke="#0284C7"/>
  <text x="445" y="105" fill="#E0F2FE" font-size="10">W1</text>
</svg>`;

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_CAD_DRAWINGS: SampleCADDrawing[] = [
  {
    id: 'cad-sample-1',
    title: 'G+2 Structural Foundation & Footing Plan',
    type: 'Structural CAD Blueprint',
    description: 'Isolated footing pads (8 No. F1 @ 1.8×1.8×0.5m, 1 No. F2 @ 2.0×2.0×0.5m), grade beams GB1 (25×40cm, 57.4ml), grid axes 1-3 & A-C, and C-25 concrete.',
    svgDataUri: svgToDataUri(FOUNDATION_PLAN_SVG),
    notes: 'Extract concrete footing pads (2.2a), grade beams (2.2c), pit excavation (1.4), and formwork (2.4a-c).',
  },
  {
    id: 'cad-sample-2',
    title: 'Ground Floor Architectural & Wall Plan',
    type: 'Architectural Floor Plan',
    description: '20cm Class-B HCB external perimeter walls (12.0m × 9.0m, H=2.8m), 15cm interior partition walls, ceramic tile flooring, doors D1 and windows W1.',
    svgDataUri: svgToDataUri(FLOOR_PLAN_SVG),
    notes: 'Extract 20cm HCB walls (2.1), 15cm HCB walls (2.2), 30x30cm ceramic floor tiles (6.8), doors and windows.',
  },
];
