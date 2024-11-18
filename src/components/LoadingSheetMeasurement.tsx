import React from 'react';
import { isWithinSpec, getInputColor } from '../utils/measurements';

interface LoadingSheetMeasurementProps {
  value: string;
  onChange: (value: string) => void;
  specifications?: {
    usl: number;
    target: number;
    lsl: number;
  };
  label: string;
  placeholder?: string;
  required?: boolean;
}

export default function LoadingSheetMeasurement({
  value,
  onChange,
  specifications,
  label,
  placeholder = "0.000",
  required = false
}: LoadingSheetMeasurementProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d{0,4}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const getColorClass = () => {
    if (!specifications || !value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return getInputColor(isWithinSpec(numValue, specifications));
  };

  const getValueStatus = () => {
    if (!specifications || !value) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    const status = isWithinSpec(numValue, specifications);
    let message = '';
    let color = '';

    switch (status) {
      case 'good':
        message = 'Within specification';
        color = 'text-green-700';
        break;
      case 'warning':
        message = 'Near specification limit';
        color = 'text-yellow-700';
        break;
      case 'error':
        message = 'Outside specification';
        color = 'text-red-700';
        break;
    }

    return { message, color };
  };

  const valueStatus = getValueStatus();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        pattern="[0-9]*"
        step="0.0001"
        value={value}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${getColorClass()}`}
        placeholder={placeholder}
        required={required}
      />
      {specifications && (
        <div className="mt-1 space-y-1">
          <div className="text-xs text-gray-500">
            Target: {specifications.target.toFixed(4)}" | 
            LSL: {specifications.lsl.toFixed(4)}" | 
            USL: {specifications.usl.toFixed(4)}"
          </div>
          {valueStatus && (
            <div className={`text-xs ${valueStatus.color}`}>
              {valueStatus.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}