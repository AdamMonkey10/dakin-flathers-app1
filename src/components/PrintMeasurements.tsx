import React from 'react';

interface Measurement {
  id: number;
  timestamp: string;
  date: string;
  machine: string;
  operator: string;
  batchNumber: string;
  topCoil: [string, string, string];
  bottomCoil: [string, string, string];
}

interface PrintMeasurementsProps {
  batchNumber: string;
  operator: string;
  machine: string;
  measurements: Measurement[];
  date: string;
}

export default function PrintMeasurements({ batchNumber, operator, machine, measurements, date }: PrintMeasurementsProps) {
  return (
    <div className="p-8 bg-white print:p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Quality Control Measurements</h1>
        <p className="text-gray-600">Dakin Flathers</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Batch Number:</strong> {batchNumber}</p>
          <p><strong>Operator:</strong> {operator}</p>
        </div>
        <div>
          <p><strong>Machine:</strong> {machine}</p>
          <p><strong>Date:</strong> {date}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Time</th>
            <th className="border border-gray-300 px-4 py-2">Machine</th>
            <th className="border border-gray-300 px-4 py-2">Operator</th>
            <th className="border border-gray-300 px-4 py-2">Top Coil Heights (inches)</th>
            <th className="border border-gray-300 px-4 py-2">Bottom Coil Heights (inches)</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((measurement) => (
            <tr key={measurement.id}>
              <td className="border border-gray-300 px-4 py-2 text-center">{measurement.date}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{measurement.timestamp}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{measurement.machine}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{measurement.operator}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {measurement.topCoil.join(' | ')}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {measurement.bottomCoil.join(' | ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-sm text-gray-500">
        <p>Generated on: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}