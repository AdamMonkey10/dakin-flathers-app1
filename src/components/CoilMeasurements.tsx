import React from 'react';
import BlockMeasurement from './BlockMeasurement';

interface CoilData {
  id: number;
  heightDifference: string;
  gaugeDifference: string;
}

interface CoilMeasurementsProps {
  coil: CoilData;
  referenceBlock: number;
  specifications?: {
    height: {
      usl: number;
      target: number;
      lsl: number;
    };
    gauge: {
      usl: number;
      target: number;
      lsl: number;
    };
  };
  onChange: (id: number, field: 'heightDifference' | 'gaugeDifference', value: string) => void;
}

export default function CoilMeasurements({ 
  coil, 
  referenceBlock,
  specifications, 
  onChange 
}: CoilMeasurementsProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Coil {coil.id}
        </h3>
      </div>

      <div className="space-y-6">
        <BlockMeasurement
          label="Height Measurement"
          value={coil.heightDifference}
          onChange={(value) => onChange(coil.id, 'heightDifference', value)}
          referenceBlock={referenceBlock}
          specifications={specifications?.height}
          required
        />
        
        <BlockMeasurement
          label="Gauge Measurement"
          value={coil.gaugeDifference}
          onChange={(value) => onChange(coil.id, 'gaugeDifference', value)}
          referenceBlock={referenceBlock}
          specifications={specifications?.gauge}
          required
        />
      </div>
    </div>
  );
}