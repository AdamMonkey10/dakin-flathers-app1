import React from 'react';
import DecimalInput from './DecimalInput';
import { formatDecimal } from '../utils/numberUtils';

interface Specifications {
  usl: number;
  target: number;
  lsl: number;
}

interface SpecificationInputsProps {
  title: string;
  heightSpecs: Specifications;
  gaugeSpecs: Specifications;
  onHeightChange: (field: keyof Specifications, value: number) => void;
  onGaugeChange: (field: keyof Specifications, value: number) => void;
}

export default function SpecificationInputs({
  title,
  heightSpecs,
  gaugeSpecs,
  onHeightChange,
  onGaugeChange
}: SpecificationInputsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Height Specifications (inches)</h4>
          <div className="grid grid-cols-3 gap-4">
            <DecimalInput
              label="USL"
              value={heightSpecs.usl}
              onChange={(value) => onHeightChange('usl', value)}
              placeholder="e.g., 2.3850"
              required
            />
            <DecimalInput
              label="Target"
              value={heightSpecs.target}
              onChange={(value) => onHeightChange('target', value)}
              placeholder="e.g., 2.3800"
              required
            />
            <DecimalInput
              label="LSL"
              value={heightSpecs.lsl}
              onChange={(value) => onHeightChange('lsl', value)}
              placeholder="e.g., 2.3750"
              required
            />
          </div>
          {heightSpecs.target > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              Current values: USL: {formatDecimal(heightSpecs.usl)}" | 
              Target: {formatDecimal(heightSpecs.target)}" | 
              LSL: {formatDecimal(heightSpecs.lsl)}"
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Gauge Specifications (inches)</h4>
          <div className="grid grid-cols-3 gap-4">
            <DecimalInput
              label="USL"
              value={gaugeSpecs.usl}
              onChange={(value) => onGaugeChange('usl', value)}
              placeholder="e.g., 0.0275"
              required
            />
            <DecimalInput
              label="Target"
              value={gaugeSpecs.target}
              onChange={(value) => onGaugeChange('target', value)}
              placeholder="e.g., 0.0250"
              required
            />
            <DecimalInput
              label="LSL"
              value={gaugeSpecs.lsl}
              onChange={(value) => onGaugeChange('lsl', value)}
              placeholder="e.g., 0.0225"
              required
            />
          </div>
          {gaugeSpecs.target > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              Current values: USL: {formatDecimal(gaugeSpecs.usl)}" | 
              Target: {formatDecimal(gaugeSpecs.target)}" | 
              LSL: {formatDecimal(gaugeSpecs.lsl)}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}