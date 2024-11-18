import React from 'react';
import { isWithinSpec, getInputColor } from '../utils/measurements';

interface BlockMeasurementProps {
  value: string;
  onChange: (value: string) => void;
  referenceBlock: number;
  specifications?: {
    usl: number;
    target: number;
    lsl: number;
  };
  label: string;
  placeholder?: string;
  required?: boolean;
}

export default function BlockMeasurement({
  value,
  onChange,
  referenceBlock,
  specifications,
  label,
  placeholder = "±0.000",
  required = false
}: BlockMeasurementProps) {
  const handleDifferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^-?\d*\.?\d{0,4}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const calculateActual = () => {
    if (!value || !specifications) return null;
    const difference = parseFloat(value);
    if (isNaN(difference)) return null;
    
    const actual = referenceBlock + difference;
    return {
      value: actual,
      status: isWithinSpec(actual, specifications)
    };
  };

  const actual = calculateActual();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Difference from Target (±inches)
          </label>
          <input
            type="number"
            inputMode="decimal"
            pattern="[0-9]*"
            step="0.0001"
            value={value}
            onChange={handleDifferenceChange}
            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
            required={required}
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Actual Measurement
          </label>
          <div className={`w-full px-3 py-2 border rounded-md ${
            actual ? getInputColor(actual.status) : 'bg-gray-50'
          }`}>
            {actual ? actual.value.toFixed(4) : '-.----'}"
          </div>
        </div>
      </div>

      {specifications && (
        <div className="text-xs space-y-1">
          <div className="text-gray-500">
            Reference Block: {referenceBlock.toFixed(4)}" | 
            Target: {specifications.target.toFixed(4)}" | 
            Range: {specifications.lsl.toFixed(4)}" - {specifications.usl.toFixed(4)}"
          </div>
          {actual && (
            <div className={`font-medium ${
              actual.status === 'good' ? 'text-green-600' :
              actual.status === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {actual.status === 'good' ? 'Within specification' :
               actual.status === 'warning' ? 'Near specification limit' :
               'Outside specification'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}