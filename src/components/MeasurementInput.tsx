import React from 'react';
import { isWithinSpec, getInputColor } from '../utils/measurements';
import { RawSteelSpecifications } from '../types';

interface MeasurementInputProps {
  value: string;
  sign: string;
  result: string;
  onValueChange: (value: string) => void;
  onSignChange: (sign: string) => void;
  onResultChange: (result: string) => void;
  specifications: RawSteelSpecifications;
  block: number;
  label: string;
  index: number;
}

export default function MeasurementInput({
  value,
  sign,
  result,
  onValueChange,
  onSignChange,
  onResultChange,
  specifications,
  block,
  label,
  index
}: MeasurementInputProps) {
  const numValue = value ? parseFloat(value) : null;
  const actualValue = numValue !== null ? (sign === '-' ? -numValue : numValue) : null;
  const blockResult = actualValue !== null ? actualValue + block : null;
  const targetValue = specifications.height.target;
  const difference = blockResult !== null ? blockResult - targetValue : null;
  const withinTolerance = difference !== null ? Math.abs(difference) <= 0.002 : false;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <select
          value={sign}
          onChange={(e) => onSignChange(e.target.value)}
          className="w-16 px-2 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="+">+</option>
          <option value="-">-</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            value ? getInputColor(isWithinSpec(actualValue || 0, specifications.height)) : ''
          }`}
          placeholder="e.g., 0.025"
        />
      </div>

      <input
        type="text"
        value={result}
        onChange={(e) => onResultChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter result"
      />
      
      {actualValue !== null && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span className="text-gray-600">Actual:</span>
              <span className="font-medium">{actualValue.toFixed(4)}"</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Block:</span>
              <span className="font-medium">{block.toFixed(4)}"</span>
            </div>
          </div>
          <div className={`p-2 rounded ${withinTolerance ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex justify-between">
              <span className={withinTolerance ? 'text-green-600' : 'text-red-600'}>Result:</span>
              <span className="font-medium">{blockResult?.toFixed(4)}"</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={withinTolerance ? 'text-green-600' : 'text-red-600'}>Diff:</span>
              <span className={`font-medium ${withinTolerance ? 'text-green-600' : 'text-red-600'}`}>
                {difference !== null ? (difference > 0 ? '+' : '') + difference.toFixed(4) : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}