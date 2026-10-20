export function formatNumber(val: number | undefined | null, decimals = 2): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) {
    return '0.00';
  }
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function detectDiameter(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*mm\s*diameter/i);
  return match ? parseFloat(match[1]) : null;
}

export function calculateBarUnitWeight(diameterMm: number): number {
  if (!diameterMm || diameterMm <= 0) return 0;
  // Standard structural steel formula: d^2 / 162 (in kg/m)
  return (diameterMm * diameterMm) / 162;
}

export function getDimsLabelsForUnit(unit: string): string[] {
  switch (unit.toLowerCase()) {
    case 'm³':
    case 'm3':
      return ['No.', 'L (m)', 'W (m)', 'H (m)'];
    case 'm²':
    case 'm2':
      return ['No.', 'L (m)', 'W (m)'];
    case 'ml':
    case 'm':
    case 'lm':
      return ['No.', 'L (m)'];
    default:
      return ['No.'];
  }
}

export function getTakeoffTypeForUnit(unit: string): 'bar' | 'dims' | 'none' {
  if (unit.toLowerCase() === 'kg') {
    return 'bar';
  }
  if (['m³', 'm3', 'm²', 'm2', 'ml', 'lm', 'm'].includes(unit.toLowerCase())) {
    return 'dims';
  }
  return 'dims';
}
