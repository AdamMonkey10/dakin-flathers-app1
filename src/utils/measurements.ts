import { RawMaterialSpecs } from '../types';

export const isWithinSpec = (value: number, spec: { usl: number; target: number; lsl: number }): 'good' | 'warning' | 'error' => {
  if (isNaN(value)) return 'error';
  
  // Tolerance zone for warning (0.0005 inches from limit)
  const warningThreshold = 0.0005;
  
  // Check if value is outside spec limits
  if (value > spec.usl || value < spec.lsl) {
    return 'error';
  }
  
  // Check if value is near spec limits
  if (value >= (spec.usl - warningThreshold) || value <= (spec.lsl + warningThreshold)) {
    return 'warning';
  }
  
  // Value is within good range
  return 'good';
};

export const getInputColor = (status: 'good' | 'warning' | 'error'): string => {
  switch (status) {
    case 'good':
      return 'bg-green-50 border-green-500';
    case 'warning':
      return 'bg-yellow-50 border-yellow-500';
    case 'error':
      return 'bg-red-50 border-red-500';
    default:
      return '';
  }
};