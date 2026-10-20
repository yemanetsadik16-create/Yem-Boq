export interface ExtractedMeasurementItem {
  id?: string;
  elementTag: string;
  description: string;
  sourceDrawing?: string;
  suggestedBoqCode: string;
  suggestedBoqSection?: 'A' | 'B' | 'ANC' | string;
  unit: string;
  count?: number;
  length?: number;
  width?: number;
  height?: number;
  calculatedQuantity: number;
  barDiameterMm?: number;
  barLengthM?: number;
  barCountPerMember?: number;
  memberCount?: number;
  confidence?: 'high' | 'medium' | 'low' | string;
  notes?: string;
  selected?: boolean;
}

export interface ExtractionResponse {
  drawingTitle: string;
  drawingType: string;
  detectedScale?: string;
  generalNotes?: string;
  extractedItems: ExtractedMeasurementItem[];
}
