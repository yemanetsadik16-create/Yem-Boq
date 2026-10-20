import { BOQSection, AncillaryItem, ProjectInfo, MarkupSettings } from '../types/boq';
import { detectDiameter, getTakeoffTypeForUnit } from '../utils/formatters';

interface RawRow {
  n?: boolean;
  no?: string;
  t: string;
  u?: string;
}

interface RawGroup {
  title: string;
  rows: RawRow[];
}

interface RawSection {
  id: string;
  title: string;
  groups: RawGroup[];
}

const RAW_BOQ: RawSection[] = [
  {
    id: 'A',
    title: 'A — Sub-Structure',
    groups: [
      {
        title: '1. Excavation & Earthwork',
        rows: [
          {
            no: '1.1',
            t: 'Excavate over site to remove all objectionable materials to an average depth of 20cm. Area of excavation includes pavement around the building.',
            u: 'm²',
          },
          {
            no: '1.2',
            t: 'Bulk excavation in ordinary soil from the reduced level to an average depth of 50cm below.',
            u: 'm³',
          },
          {
            no: '1.3',
            t: '50cm thick trench excavation in ordinary soil for stone masonry foundation wall, to a depth of 250cm starting from reduced level.',
            u: 'm³',
          },
          {
            no: '1.4',
            t: 'Pit excavation for isolated footing foundation in ordinary soil, to a depth of 300cm starting from reduced level.',
            u: 'm³',
          },
          {
            no: '1.5',
            t: 'Backfill under hard core, around masonry trench and around isolated footing, with good dry selected material, not exceeding 25cm layers.',
            u: 'm³',
          },
          {
            no: '1.6',
            t: 'Cart away surplus excavated material and deposit at a suitable distance.',
            u: 'm³',
          },
          {
            no: '1.7',
            t: '25cm thick basaltic (or equivalent) stone hard core, well rolled, consolidated and blinded with crushed stone.',
            u: 'm²',
          },
        ],
      },
      {
        title: '2. Concrete Work',
        rows: [
          {
            n: true,
            t: '5cm thick lean concrete, grade C-5, minimum cement content 150kg/m³:',
          },
          { no: '2.1a', t: 'Under footing pad.', u: 'm²' },
          { no: '2.1b', t: 'Under masonry and grade beam.', u: 'm²' },
          { no: '2.1c', t: 'Under hard core.', u: 'm²' },
          {
            n: true,
            t: 'Reinforced concrete grade C-25, 360kg cement/m³, filled into formwork and vibrated around reinforcement bars (steel and formwork measured separately):',
          },
          { no: '2.2a', t: 'Footing pad.', u: 'm³' },
          { no: '2.2b', t: 'Foundation column.', u: 'm³' },
          { no: '2.2c', t: 'Grade beam.', u: 'm³' },
          { no: '2.2d', t: '10cm thick ground floor slab.', u: 'm²' },
          {
            n: true,
            t: 'Provide, cut and fix in position sawn Zigba wood or metal panel formwork:',
          },
          { no: '2.4a', t: 'Footing pad.', u: 'm²' },
          { no: '2.4b', t: 'Foundation column.', u: 'm²' },
          { no: '2.4c', t: 'Grade beam.', u: 'm²' },
          {
            n: true,
            t: 'Reinforcement bar to structural drawings — price includes cutting, bending, placing in position and tying wire:',
          },
          { no: '2.5a', t: '8mm diameter deformed bars.', u: 'kg' },
          { no: '2.5b', t: '14mm diameter deformed bars.', u: 'kg' },
          { no: '2.5c', t: '16mm diameter deformed bars.', u: 'kg' },
          { no: '2.5d', t: '20mm diameter deformed bars.', u: 'kg' },
        ],
      },
      {
        title: '3. Masonry Work',
        rows: [
          {
            no: '3.1',
            t: '50cm thick hard trachytic (or equivalent) stone masonry foundation wall, bedded in cement mortar (1:4), below natural ground level.',
            u: 'm³',
          },
          { no: '3.2', t: 'Ditto, but above natural ground level.', u: 'm³' },
          { no: '3.3', t: 'Ditto (1:4), but for steps.', u: 'm³' },
        ],
      },
    ],
  },
  {
    id: 'B',
    title: 'B — Super-Structure',
    groups: [
      {
        title: '1. Concrete Work',
        rows: [
          {
            n: true,
            t: 'Reinforced concrete grade C-25, 360kg cement/m³, filled into formwork and vibrated around reinforcement bars (steel and formwork measured separately):',
          },
          { no: '1.1a', t: 'Elevation column.', u: 'm³' },
          { no: '1.1b', t: 'Intermediate and top tie beam.', u: 'm³' },
          { no: '1.1c', t: '15cm thick solid slab.', u: 'm³' },
          { no: '1.1d', t: 'Stair case and landing.', u: 'm³' },
          {
            n: true,
            t: 'Provide, cut and fix in position metal panel or sawn Zigba wood formwork:',
          },
          { no: '1.2a', t: 'Elevation column.', u: 'm²' },
          { no: '1.2b', t: 'Intermediate and top tie beam.', u: 'm²' },
          { no: '1.2c', t: '15cm thick solid slab.', u: 'm²' },
          { no: '1.2d', t: 'Stair case and landing.', u: 'm²' },
          {
            n: true,
            t: 'Reinforcement bar to structural drawings — price includes cutting, bending, placing in position and tying wire:',
          },
          { no: '1.3a', t: '8mm diameter deformed bars.', u: 'kg' },
          { no: '1.3b', t: '10mm diameter deformed bars.', u: 'kg' },
          { no: '1.3c', t: '12mm diameter deformed bars.', u: 'kg' },
          { no: '1.3d', t: '14mm diameter deformed bars.', u: 'kg' },
          { no: '1.3e', t: '16mm diameter deformed bars.', u: 'kg' },
        ],
      },
      {
        title: '2. Block Work',
        rows: [
          {
            no: '2.1',
            t: '20cm thick class-B HCB wall, bedded and jointed in cement mortar mix 1:3, both sides left for plaster.',
            u: 'm²',
          },
          { no: '2.2', t: 'Ditto, but 15cm thick class-B HCB wall.', u: 'm²' },
        ],
      },
      {
        title: '3. Roofing Work',
        rows: [
          {
            no: '3.1',
            t: 'C-30 roof cover in corrugated galvanised iron sheet (CIS), fixed to wooden purlins with dome-headed nails; price includes ridge cap (purlins and roof measured in horizontal projection with all accessories).',
            u: 'm²',
          },
          {
            no: '3.2',
            t: 'Supply and fix G-30 galvanised flat metal sheet gutter as per detail drawing; price includes all accessories, metal bracket suspenders, one coat anti-rust paint and two coats synthetic enamel paint.',
            u: 'ml',
          },
          {
            no: '3.3',
            t: 'Down pipe fixed to RC column with metal strap, at 100cm centres.',
            u: 'ml',
          },
        ],
      },
      {
        title: '4. Carpentry & Joinery Work',
        rows: [
          {
            n: true,
            t: 'Eucalyptus truss — all structural members painted 2 coats anti-termite paint, well seasoned, each truss fixed to RC beam with 6mm plain bar (spacing per drawing):',
          },
          { no: '4.1a', t: '12cm upper and lower chord.', u: 'ml' },
          { no: '4.1b', t: '10cm diagonal and vertical members.', u: 'ml' },
          { no: '4.1c', t: '5x7cm Zigba wood purlin.', u: 'ml' },
          {
            no: '4.2',
            t: 'Supply and fix flush wooden door with Tid wood frames, both sides covered with best quality 4mm thick plywood; price includes all necessary accessories. Door D1, size 70 x 210cm.',
            u: 'pcs',
          },
        ],
      },
      {
        title: '5. Metal Work',
        rows: [
          {
            n: true,
            t: 'Supply and fix metal door and window made of imitation profile with grill, fabricated from manufactured tubular steel profile, approved cylindrical lock as per drawing — price includes all necessary work (Doors):',
          },
          { no: '5.1a', t: 'Door D1, size 90 x 300cm.', u: 'pcs' },
          { no: '5.1b', t: 'Combined door & window DW1, size 253 x 300cm.', u: 'pcs' },
          { no: '5.1c', t: 'Fire door FD1, size 375 x 300cm.', u: 'pcs' },
          { no: '5.1d', t: 'Fire door FD2, size 165 x 300cm.', u: 'pcs' },
          {
            no: '5.2',
            t: 'Supply and fix metal window made of imitation profile with grill, complete with all accessories, including 1 coat anti-rust and 2 coats synthetic paint. Type W-1, size 60 x 60cm.',
            u: 'pcs',
          },
          {
            n: true,
            t: 'Supply and fix metal balustrade for corridor to schedule — main post 40x40x2.5mm RHS fixed to slab by cement grouting at 1.5m c/c; horizontal frame 30x30x2.5mm RHS fixed to column at 40cm c/c; central panel RHS 25x25x2mm; price includes cutting, welding and 3 coats synthetic paint over anti-rust primer:',
          },
          { no: '5.3a', t: 'RHS 40 x 40 x 2.5mm.', u: 'kg' },
          { no: '5.3b', t: 'RHS 30 x 30 x 2.5mm.', u: 'kg' },
          { no: '5.3c', t: 'RHS 25 x 25 x 2mm.', u: 'kg' },
          {
            n: true,
            t: 'Supply and fix metal balustrade with Kararo wood handrail for stair case:',
          },
          { no: '5.4a', t: 'RHS 40 x 40 x 2.5mm.', u: 'kg' },
          { no: '5.4b', t: 'RHS 30 x 30 x 2.5mm.', u: 'kg' },
          {
            no: '5.4c',
            t: 'Kararo wooden handrail, size 40 x 60mm, screwed at 30cm centres to RHS section.',
            u: 'ml',
          },
          {
            no: '5.4d',
            t: '15 x 2.5cm nicely planed and polished Kararo wood strings.',
            u: 'ml',
          },
        ],
      },
      {
        title: '6. Finishing Work',
        rows: [
          {
            no: '6.1',
            t: 'Apply three coats plaster in cement mortar mix 1:3 to fine finish, to all internal surfaces, exposed concrete columns and beams.',
            u: 'm²',
          },
          { no: '6.2', t: 'Ditto, but to external wall surface.', u: 'm²' },
          { no: '6.3', t: 'Ditto, but to solid slab.', u: 'm²' },
          {
            no: '6.4',
            t: 'Apply three coats tyrolean rendering to exterior surface (machine rendering).',
            u: 'm²',
          },
          {
            no: '6.5',
            t: 'Supply and fix plastic ceiling on 4x5cm Zigba wood buttons at 60cm centres both ways; price includes ceiling button and angle trim.',
            u: 'm²',
          },
          {
            no: '6.6',
            t: '30cm tread and 20cm riser marble for stair case.',
            u: 'ml',
          },
          {
            no: '6.7',
            t: '3cm thick marble window sill, 30cm wide, bedded in cement and sand mortar mix (1:3).',
            u: 'ml',
          },
          {
            no: '6.8',
            t: 'Supply and fix 30 x 30cm non-slip ceramic tile floor finish, bedded and joints grouted in cement/sand mortar (1:3), for verandah, stair and lobby.',
            u: 'm²',
          },
          {
            no: '6.9',
            t: 'Ditto, but 15 x 15cm ceramic wall tile for shower room.',
            u: 'm²',
          },
          {
            no: '6.10',
            t: 'Ditto, but cement concrete terrazzo tile floor finish.',
            u: 'm²',
          },
          {
            no: '6.11',
            t: '10cm high ceramic tile skirting, stuck down with cement/sand mortar (1:3).',
            u: 'ml',
          },
          {
            no: '6.12',
            t: 'Supply and lay 110cm wide, 10cm thick mass concrete C-15 pavement around the building, including crushed stone and 10cm thick compacted red ash.',
            u: 'm²',
          },
          {
            no: '6.13',
            t: 'Supply and fix open ditch with half cement-concrete pipe, d=40cm, bedded and jointed in 1:3 mortar; price includes selected material fill.',
            u: 'ml',
          },
        ],
      },
      {
        title: '7. Glazing Work',
        rows: [
          {
            no: '7.1',
            t: 'Supply and fix 6mm thick ordinary clear sheet glass, glazed to metal casement with putty.',
            u: 'm²',
          },
        ],
      },
      {
        title: '8. Painting Work',
        rows: [
          {
            n: true,
            t: 'Prepare surface and apply three coats plastic emulsion paint of chosen type and colour to:',
          },
          {
            no: '8.1',
            t: 'Internal plastered surface and exposed concrete column and beam.',
            u: 'm²',
          },
          { no: '8.2', t: 'Ditto, but external plastered wall surface.', u: 'm²' },
          { no: '8.3', t: 'Ditto, but rendered wall.', u: 'm²' },
          { no: '8.4', t: 'Ditto, but quartzite paint to external wall.', u: 'm²' },
          { no: '8.5', t: 'Ditto, but solid slab.', u: 'm²' },
          {
            no: '8.6',
            t: 'Ditto, but synthetic paint to metal door and window.',
            u: 'm²',
          },
        ],
      },
      {
        title: '9. Sanitary Installation — Interior',
        rows: [
          {
            n: true,
            t: 'Water supply pipes and fittings — supply and install galvanised steel pipes from elevated water tank to cold/hot water distribution, to all sanitary fixtures shown on drawing:',
          },
          { no: '9.1a', t: 'Diameter 15mm.', u: 'ml' },
          { no: '9.1b', t: 'Diameter 20mm.', u: 'ml' },
          {
            n: true,
            t: 'Supply and install gate valves, brass, complete with rubber gaskets, hand wheels and connecting pieces (unions etc.) for all fixtures:',
          },
          { no: '9.2a', t: 'Diameter 15mm.', u: 'pcs' },
          { no: '9.2b', t: 'Diameter 20mm.', u: 'pcs' },
          {
            n: true,
            t: 'Elevated water tank — supply and mount 8m³ fibreglass water tank on roof, complete with all accessories:',
          },
          { no: '9.3a', t: 'Water tank, size 4 x 2m.', u: 'pc' },
          { no: '9.3b', t: '32mm brass gate valve for outlet pipe.', u: 'pcs' },
          { no: '9.3c', t: '32mm brass gate valve for drain pipe.', u: 'pcs' },
          { no: '9.3d', t: '32mm brass gate valve for inlet pipe.', u: 'pcs' },
          { no: '9.3e', t: '40mm PVC float valve.', u: 'pcs' },
          { no: '9.3f', t: '50mm PVC vent pipe with vent cap, 30cm length.', u: 'pcs' },
          { no: '9.3g', t: '32mm drain and overflow galvanised steel pipe.', u: 'ml' },
          { no: '9.3h', t: 'Roto stand made of concrete pole and slab.', u: 'lump' },
          { n: true, t: 'Sanitary fixtures:' },
          {
            no: '9.4',
            t: 'Supply and install low-level water closet, white glazed vitreous china WC pan, approved quality, complete with all accessories.',
            u: 'pcs',
          },
          {
            no: '9.5',
            t: 'Supply and install hand wash basin, white vitreous china, two tap holes, complete with all accessories. Size 500 x 405mm.',
            u: 'pcs',
          },
          {
            no: '9.6',
            t: 'Supply and install white glazed steel/cast-iron shower tray with slip-resistant base, 15mm chrome-plated shower mixer with hot & cold taps, concealed riser tube, chrome-plated shower arm and swivel spray head, 38mm brass waste drain with chrome grate, 38mm uPVC trap. Size 900 x 900mm.',
            u: 'pcs',
          },
          {
            no: '9.7',
            t: 'Supply and install single tubular chrome-plated swing towel hanger with chrome-plated fastening screws, complete with all accessories.',
            u: 'pcs',
          },
          {
            no: '9.8',
            t: 'Supply and fix toilet paper holder, white vitreous china, complete with all accessories.',
            u: 'pcs',
          },
          {
            no: '9.9',
            t: 'Supply and fix crystal glass mirror, 500 x 400mm, including chrome-plated brass clips and screws.',
            u: 'pcs',
          },
          { n: true, t: 'Waste water & ventilation pipe:' },
          {
            no: '9.10',
            t: 'Supply and fix water heater complete with all accessories, capacity 25 litres.',
            u: 'pcs',
          },
          {
            no: '9.11',
            t: 'Supply and install waste and vent pipe, horizontal branches and vertical stacks, PVC, including fittings (bends, branches, tees, elbows); horizontal branches laid at 2% slope. Diameter 50mm.',
            u: 'ml',
          },
          {
            no: '9.12',
            t: 'Supply and install vent caps, PVC, at vent pipes fitted with PVC roof weathering slate at roof level. Diameter 50mm.',
            u: 'pc',
          },
        ],
      },
      {
        title: '9. Sanitary Installation — Site Works',
        rows: [
          {
            no: '9.13',
            t: 'Construct sanitary manholes on domestic sewer line, double brick wall on mass concrete base slab 150mm thick, proper slope for smooth flow, 80mm RC slab cover with steel bar handle as per detail drawing. Size 60 x 60cm, average depth 60cm.',
            u: 'pc',
          },
          {
            no: '9.14',
            t: 'Supply and lay hard plastic sewerage pipe as per drawing. Diameter 150mm.',
            u: 'ml',
          },
          {
            no: '9.15',
            t: 'Supply and install galvanised steel pipe from main line to roof fibreglass water tank, complete with all accessories. Diameter 32mm.',
            u: 'ml',
          },
        ],
      },
      {
        title: '10. Electrical Installation',
        rows: [
          { n: true, t: 'Power intake — underground ducts/pipes:' },
          { no: '10.1', t: 'PVC pipe, 50mm diameter.', u: 'ml' },
          { n: true, t: 'Manhole:' },
          {
            no: '10.2',
            t: 'Construct manhole in brick with internal concrete base 600 x 600 x 600mm, including concrete cover with lifting hole.',
            u: 'no',
          },
          { n: true, t: 'Low voltage system earthing:' },
          {
            no: '10.3',
            t: '2400 x 16mm copper-clad earthing rod inside 600 x 600 x 600mm pit (pit measured elsewhere).',
            u: 'no',
          },
          {
            no: '10.4',
            t: '1 x 16 sq.mm bare copper bonding conductor, from earth bar to MLPP-TP3 earthing terminal.',
            u: 'ml',
          },
          { n: true, t: 'Distribution board:' },
          {
            no: '10.5',
            t: 'Flush-mounted distribution board LPP-TF, engraved identification tag, sheet-steel enclosure with lockable door, 63A 3-phase bus bars with all fixing/connecting accessories — 2 no. 10A MCB 1ph 6kA, 10 no. 16A MCB 1ph 10kA, 1 no. main 32A MCB 3ph 10kA, with 25% reserve capacity.',
            u: 'no',
          },
          {
            no: '10.6',
            t: 'Flush-mounted sub distribution board MDB with lockable door, 400A/3ph bus rating, complete with 1 no. MCCB 320A/3ph Icu=16kA, 5 no. MCB 63A/3ph Icu=10kA, 8 no. MCB 25A/3ph Icu=10kA, with 20% reserve space.',
            u: 'no',
          },
          { n: true, t: 'Feeder cable and PVC pipe:' },
          { no: '10.7', t: 'Cable, 5 x 10 sq.mm, from MLPP-TP3 to LPP-LF.', u: 'ml' },
          { no: '10.8', t: 'PVC pipe, 32mm diameter.', u: 'ml' },
          { n: true, t: 'Light points:' },
          {
            no: '10.9',
            t: 'Light point fed through PVC-insulated conductor 2 x 2.5 sq.mm in 16mm diameter thermoplastic conduit, in/under surface, including junction boxes, screw-type connectors, insulating caps and cover, with all accessories.',
            u: 'no',
          },
          {
            n: true,
            t: 'Switches — flush-mounted Legrand Suno range (or equivalent) with matching box:',
          },
          { no: '10.10', t: 'Single pole.', u: 'no' },
          { no: '10.11', t: 'Double pole.', u: 'no' },
          { n: true, t: 'Socket outlet point:' },
          {
            no: '10.12',
            t: 'Socket outlet point, flush mounting, fed through PVC conductor 3 x 2.5 sq.mm in 16mm diameter thermoplastic conduit (or 3 x 4 sq.mm in 21mm diameter), including junction boxes, screw-type connectors and cover, complete.',
            u: 'no',
          },
          {
            no: '10.13',
            t: 'Telephone point — conduit 19–29mm diameter, outlet box, pull wire and telephone terminal box, per ETC rules and regulations.',
            u: 'no',
          },
        ],
      },
    ],
  },
];

export function createInitialBoq(): BOQSection[] {
  return RAW_BOQ.map((sec) => ({
    id: sec.id,
    title: sec.title,
    groups: sec.groups.map((g, gIdx) => ({
      id: `${sec.id}-${gIdx}`,
      title: g.title,
      isOpen: true,
      items: g.rows.map((r, rIdx) => {
        if (r.n) {
          return {
            id: `${sec.id}-${gIdx}-${rIdx}-note`,
            isNote: true,
            description: r.t,
            unit: '',
            quantity: '',
            unitRate: '',
            amount: 0,
            takeoffType: 'none',
            takeoffLines: [],
          };
        }
        const unit = r.u || 'pcs';
        const type = getTakeoffTypeForUnit(unit);
        const dia = type === 'bar' ? detectDiameter(r.t) : null;

        return {
          id: `${sec.id}-${gIdx}-${rIdx}`,
          isNote: false,
          itemNo: r.no,
          description: r.t,
          unit: unit,
          quantity: '',
          unitRate: '',
          amount: 0,
          takeoffType: type,
          detectedDia: dia,
          takeoffLines: [],
          isTakeoffOpen: false,
        };
      }),
    })),
  }));
}

export const BLANK_PROJECT_INFO: ProjectInfo = {
  projectName: '',
  location: '',
  client: '',
  contractor: '',
  consultant: '',
  currency: 'ETB',
  sheetDate: new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
};

export const INITIAL_PROJECT_INFO: ProjectInfo = { ...BLANK_PROJECT_INFO };

export const INITIAL_MARKUP: MarkupSettings = {
  profitPct: 7.0,
  overheadPct: 7.0,
  vatPct: 15.0,
};

export const INITIAL_ANCILLARY: AncillaryItem[] = [
  {
    id: 'anc-1',
    description: 'Septic tank & manhole (reinforced concrete, complete per site take-off)',
    amount: '',
  },
];
