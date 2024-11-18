// Utility functions for number handling
export const formatDecimal = (value: number): string => {
  return value.toFixed(4);
};

export const parseDecimal = (value: string): number => {
  if (value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const validateDecimalInput = (value: string): boolean => {
  // Allow empty string, digits, one decimal point, and any decimal places
  return value === '' || /^\d*\.?\d*$/.test(value);
};