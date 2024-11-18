import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

interface HeightDistributionChartProps {
  data: number[];
  specifications?: {
    usl: number;
    target: number;
    lsl: number;
  };
  title: string;
  color: string;
}

export default function HeightDistributionChart({
  data,
  specifications,
  title,
  color
}: HeightDistributionChartProps) {
  // Create histogram data
  const createHistogram = (measurements: number[], bins = 20) => {
    if (!measurements || measurements.length === 0) return [];

    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    // If min and max are the same, adjust to prevent division by zero
    if (min === max) {
      return [{
        range: `${min.toFixed(4)}`,
        count: measurements.length,
        binCenter: min
      }];
    }

    // Adjust bin width to include specification limits if provided
    let adjustedMin = min;
    let adjustedMax = max;
    if (specifications) {
      adjustedMin = Math.min(min, specifications.lsl - 0.0005);
      adjustedMax = Math.max(max, specifications.usl + 0.0005);
    }

    const binWidth = (adjustedMax - adjustedMin) / bins;

    // Initialize bins
    const histogram = Array.from({ length: bins }, (_, i) => ({
      binStart: adjustedMin + i * binWidth,
      binEnd: adjustedMin + (i + 1) * binWidth,
      count: 0
    }));

    // Fill bins
    measurements.forEach(value => {
      if (typeof value === 'number' && !isNaN(value)) {
        const binIndex = Math.min(
          Math.floor((value - adjustedMin) / binWidth),
          bins - 1
        );
        if (histogram[binIndex]) {
          histogram[binIndex].count++;
        }
      }
    });

    // Format for display
    return histogram.map(bin => ({
      range: `${bin.binStart.toFixed(4)}-${bin.binEnd.toFixed(4)}`,
      count: bin.count,
      binCenter: (bin.binStart + bin.binEnd) / 2
    }));
  };

  const histogramData = createHistogram(data);

  if (histogramData.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="w-full aspect-[16/9] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for histogram</p>
        </div>
      </div>
    );
  }

  // Find the maximum count for setting y-axis domain
  const maxCount = Math.max(...histogramData.map(d => d.count));

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {specifications && (
        <div className="mb-4 text-sm">
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
            <div>
              <span className="text-gray-600">LSL: </span>
              <span className="font-medium">{specifications.lsl.toFixed(4)}"</span>
            </div>
            <div>
              <span className="text-gray-600">Target: </span>
              <span className="font-medium">{specifications.target.toFixed(4)}"</span>
            </div>
            <div>
              <span className="text-gray-600">USL: </span>
              <span className="font-medium">{specifications.usl.toFixed(4)}"</span>
            </div>
          </div>
        </div>
      )}
      <div className="w-full aspect-[16/9]">
        <BarChart
          width={800}
          height={400}
          data={histogramData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="binCenter"
            tickFormatter={(value) => value.toFixed(4)}
            label={{ value: 'Height (inches)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            domain={[0, maxCount + Math.ceil(maxCount * 0.1)]} // Add 10% padding to top
          />
          <Tooltip
            formatter={(value: any, name: string) => [value, 'Frequency']}
            labelFormatter={(label: number) => `Height: ${label.toFixed(4)}"`}
          />
          <Legend />
          <Bar dataKey="count" fill={color} name="Frequency" />
          
          {specifications && (
            <>
              <ReferenceLine
                x={specifications.target}
                stroke="#2563eb"
                label={{
                  value: 'Target',
                  position: 'top',
                  fill: '#2563eb',
                  fontSize: 12
                }}
              />
              <ReferenceLine
                x={specifications.lsl}
                stroke="#dc2626"
                label={{
                  value: 'LSL',
                  position: 'top',
                  fill: '#dc2626',
                  fontSize: 12
                }}
              />
              <ReferenceLine
                x={specifications.usl}
                stroke="#dc2626"
                label={{
                  value: 'USL',
                  position: 'top',
                  fill: '#dc2626',
                  fontSize: 12
                }}
              />
            </>
          )}
        </BarChart>
      </div>
    </div>
  );
}