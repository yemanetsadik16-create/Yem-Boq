export type TakeoffType = 'dims' | 'bar' | 'none';

export interface TakeoffLine {
  id: string;
  note: string;
  // For standard dimensional take-off:
  dims: (number | '')[];
  // For bar schedules:
  barLen?: number | '';
  barCount?: number | '';
  memberCount?: number | '';
  kgPerM?: number | '';
  result: number;
}

export interface BOQItem {
  id: string;
  isNote?: boolean;
  itemNo?: string;
  description: string;
  unit: string;
  quantity: number | '';
  unitRate: number | '';
  amount: number;
  isCustom?: boolean;
  takeoffType: TakeoffType;
  detectedDia?: number | null;
  takeoffLines: TakeoffLine[];
  isTakeoffOpen?: boolean;
}

export interface BOQGroup {
  id: string;
  title: string;
  isOpen: boolean;
  items: BOQItem[];
}

export interface BOQSection {
  id: string;
  title: string;
  groups: BOQGroup[];
}

export interface AncillaryItem {
  id: string;
  description: string;
  amount: number | '';
}

export interface ProjectInfo {
  projectName: string;
  location: string;
  client: string;
  contractor: string;
  consultant: string;
  currency: string;
  sheetDate: string;
}

export interface MarkupSettings {
  profitPct: number;
  overheadPct: number;
  vatPct: number;
}

export interface CalculatedCostSummary {
  sectionTotals: Record<string, number>;
  ancillaryTotal: number;
  subTotal: number;
  profitAmount: number;
  overheadAmount: number;
  totalBeforeVat: number;
  vatAmount: number;
  grandTotal: number;
}
