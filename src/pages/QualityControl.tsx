import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckSquare, PlusCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

interface Measurement {
  id: number;
  timestamp: string;
  batchNumber: string;
  operator: string;
  machine: string;
  testType: string;
  result: string;
  topCoil: [string, string, string];
  bottomCoil: [string, string, string];
  microscopeChecks?: {
    toothProfile: boolean;
    indexTooth: boolean;
  };
}

export default function QualityControl() {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [batchNumber, setBatchNumber] = useState(localStorage.getItem('currentBatchNumber') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing measurements
    const savedMeasurements = localStorage.getItem('measurements');
    if (savedMeasurements) {
      setMeasurements(JSON.parse(savedMeasurements));
    }
  }, []);

  const handleAddTest = () => {
    navigate('/test-sheet');
  };

  const handleCompleteBatch = () => {
    navigate('/batch-completion');
  };

  const handlePrintTable = () => {
    window.print();
  };

  const getTestTypeColor = (testType: string) => {
    switch (testType) {
      case 'initial':
        return 'bg-blue-100 text-blue-800';
      case 'regular':
        return 'bg-green-100 text-green-800';
      case 'final':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    return result === 'pass' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 no-print">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex space-x-4">
            <button
              onClick={handleAddTest}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Test
            </button>
            <button
              onClick={handleCompleteBatch}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Complete Batch
            </button>
            <button
              onClick={handlePrintTable}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print History
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 no-print">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            <div className="text-sm text-gray-600">Batch: {batchNumber}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Operator</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Machine</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Test Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Top Coil</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Bottom Coil</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {measurements.map((measurement) => (
                  <tr key={measurement.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{measurement.timestamp}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{measurement.operator}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{measurement.machine}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTestTypeColor(measurement.testType)}`}>
                        {measurement.testType.charAt(0).toUpperCase() + measurement.testType.slice(1)}
                        {measurement.microscopeChecks && '✓'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{measurement.topCoil.join(' | ')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{measurement.bottomCoil.join(' | ')}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(measurement.result)}`}>
                        {measurement.result.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {measurements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No test results recorded yet. Click "Add Test" to begin.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}