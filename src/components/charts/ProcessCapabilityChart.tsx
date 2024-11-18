import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

interface ProcessCapabilityChartProps {
  data: number[];
  specifications?: {
    usl: number;
    target: number;
    lsl: number;
  };
  title: string;
  color: string;
}

export default function ProcessCapabilityChart({
  data,
  specifications,
  title,
  color
}: ProcessCapabilityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="w-full aspect-[16/9] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for process control chart</p>
        </div>
      </div>
    );
  }

  // Create control chart data
  const createControlChartData = (measurements: number[]) => {
    return measurements
      .filter(value => typeof value === 'number' && !isNaN(value))
      .map((value, index) => ({
        index: index + 1,
        value
      }));
  };

  const chartData = createControlChartData(data);

  // Calculate control limits and process capability
  const validValues = data.filter(value => typeof value === 'number' && !isNaN(value));
  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const stdDev = Math.sqrt(
    validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validValues.length
  );
  const ucl = mean + 3 * stdDev;
  const lcl = mean - 3 * stdDev;

  // Calculate process capability indices if specifications are provided
  let cp = null;
  let cpk = null;
  if (specifications) {
    const { usl, lsl } = specifications;
    cp = (usl - lsl) / (6 * stdDev);
    const cpu = (usl - mean) / (3 * stdDev);
    const cpl = (mean - lsl) / (3 * stdDev);
    cpk = Math.min(cpu, cpl);
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Mean: {mean.toFixed(4)}"</p>
          <p className="text-gray-600">Std Dev: {stdDev.toFixed(4)}"</p>
        </div>
        {specifications && (
          <div>
            <p className="text-gray-600">Cp: {cp !== null ? cp.toFixed(2) : 'N/A'}</p>
            <p className="text-gray-600">Cpk: {cpk !== null ? cpk.toFixed(2) : 'N/A'}</p>
          </div>
        )}
      </div>
      <div className="w-full aspect-[16/9]">
        <LineChart
          width={800}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            label={{ value: 'Measurement Number', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            label={{ value: 'Height (inches)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any) => value.toFixed(4)}
            labelFormatter={(label: number) => `Measurement ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={{ r: 1 }}
            name="Height"
          />

          <ReferenceLine
            y={mean}
            stroke="#2563eb"
            strokeDasharray="3 3"
            label={{ 
              value: `Mean: ${mean.toFixed(4)}"`,
              position: 'right',
              fill: '#2563eb'
            }}
          />
          <ReferenceLine
            y={ucl}
            stroke="#dc2626"
            strokeDasharray="3 3"
            label={{ 
              value: `UCL: ${ucl.toFixed(4)}"`,
              position: 'right',
              fill: '#dc2626'
            }}
          />
          <ReferenceLine
            y={lcl}
            stroke="#dc2626"
            strokeDasharray="3 3"
            label={{ 
              value: `LCL: ${lcl.toFixed(4)}"`,
              position: 'right',
              fill: '#dc2626'
            }}
          />

          {specifications && (
            <>
              <ReferenceLine
                y={specifications.target}
                stroke="#2563eb"
                label={{ 
                  value: `Target: ${specifications.target.toFixed(4)}"`,
                  position: 'right',
                  fill: '#2563eb'
                }}
              />
              <ReferenceLine
                y={specifications.lsl}
                stroke="#dc2626"
                label={{ 
                  value: `LSL: ${specifications.lsl.toFixed(4)}"`,
                  position: 'right',
                  fill: '#dc2626'
                }}
              />
              <ReferenceLine
                y={specifications.usl}
                stroke="#dc2626"
                label={{ 
                  value: `USL: ${specifications.usl.toFixed(4)}"`,
                  position: 'right',
                  fill: '#dc2626'
                }}
              />
            </>
          )}
        </LineChart>
      </div>
    </div>
  );
}