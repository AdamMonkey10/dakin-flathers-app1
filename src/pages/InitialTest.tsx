import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { saveMeasurement, updateBatch, getActiveBatch, getRawSteelBySKU } from '../lib/db';
import { useMachine } from '../contexts/MachineContext';
import { isWithinSpec } from '../utils/measurements';
import BlockMeasurement from '../components/BlockMeasurement';
import OperatorSelect from '../components/OperatorSelect';

export default function InitialTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: machineId } = useParams();
  const { updateMachineProgress } = useMachine();
  
  const [batchData, setBatchData] = useState<any>(null);
  const [rawSteelData, setRawSteelData] = useState<any>(null);
  const [operator, setOperator] = useState('');
  const [topCoilDiffs, setTopCoilDiffs] = useState<[string, string, string]>(['', '', '']);
  const [bottomCoilDiffs, setBottomCoilDiffs] = useState<[string, string, string]>(['', '', '']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [microscopeChecks, setMicroscopeChecks] = useState({
    toothProfile: false,
    indexTooth: false
  });

  useEffect(() => {
    const loadBatchData = async () => {
      if (!machineId) return;

      try {
        const activeBatch = await getActiveBatch(machineId);
        if (!activeBatch) {
          throw new Error('No active batch found');
        }
        setBatchData(activeBatch);

        const rawSteel = await getRawSteelBySKU(activeBatch.sku);
        if (rawSteel) {
          setRawSteelData(rawSteel);
        }
      } catch (err: any) {
        console.error('Error loading batch:', err);
        setError(err.message || 'Failed to load batch data');
      } finally {
        setLoading(false);
      }
    };

    loadBatchData();
  }, [machineId]);

  const determineResult = (): 'pass' | 'fail' => {
    if (!rawSteelData?.processedMaterial?.height) return 'fail';

    const specs = rawSteelData.processedMaterial.height;
    const allMeasurements = [
      ...topCoilDiffs.map(diff => calculateActualValue(diff)),
      ...bottomCoilDiffs.map(diff => calculateActualValue(diff))
    ];

    return allMeasurements.every(measurement => {
      if (measurement === null) return false;
      return isWithinSpec(measurement, specs) === 'good';
    }) && microscopeChecks.toothProfile && microscopeChecks.indexTooth
      ? 'pass'
      : 'fail';
  };

  const calculateActualValue = (difference: string): number | null => {
    if (!difference || !rawSteelData?.referenceBlock) return null;
    const diffValue = parseFloat(difference);
    if (isNaN(diffValue)) return null;
    return rawSteelData.referenceBlock + diffValue;
  };

  const handleDifferenceChange = (
    values: [string, string, string],
    setValues: React.Dispatch<React.SetStateAction<[string, string, string]>>,
    index: number,
    value: string
  ) => {
    if (value === '' || /^-?\d*\.?\d{0,4}$/.test(value)) {
      const newValues = [...values] as [string, string, string];
      newValues[index] = value;
      setValues(newValues);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId || !batchData) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = determineResult();

      await saveMeasurement(batchData.id, machineId, {
        operator,
        sku: batchData.sku,
        testType: 'initial',
        result,
        topCoil: topCoilDiffs.map(diff => calculateActualValue(diff)),
        bottomCoil: bottomCoilDiffs.map(diff => calculateActualValue(diff)),
        microscopeChecks
      });

      await updateBatch(batchData.id, {
        initialTestComplete: true
      });

      await updateMachineProgress(machineId, { initialTest: true });

      navigate(`/machine/${machineId}/test`, {
        state: { 
          batchNumber: batchData.batchNumber,
          batchId: batchData.id,
          machineId,
          sku: batchData.sku
        }
      });
    } catch (err: any) {
      console.error('Error saving measurement:', err);
      setError(err.message || 'Failed to save measurement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading test form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const result = determineResult();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Initial Test
            {batchData && (
              <span className="text-sm text-gray-600 ml-4">
                Batch: {batchData.batchNumber}
              </span>
            )}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Block Name</h3>
                <p className="text-lg font-semibold text-blue-700">
                  {rawSteelData?.blockName || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Reference Block Value</h3>
                <p className="text-lg font-semibold text-blue-700">
                  {rawSteelData?.referenceBlock ? `${rawSteelData.referenceBlock.toFixed(4)}"` : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Test Result</h3>
                <p className={`text-lg font-semibold ${
                  result === 'pass' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operator
              </label>
              <OperatorSelect
                value={operator}
                onChange={setOperator}
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Microscope Checks</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={microscopeChecks.toothProfile}
                    onChange={(e) => setMicroscopeChecks(prev => ({
                      ...prev,
                      toothProfile: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2">Tooth Profile Verified</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={microscopeChecks.indexTooth}
                    onChange={(e) => setMicroscopeChecks(prev => ({
                      ...prev,
                      indexTooth: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2">Index Tooth Check</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Measurements</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Top Coil Measurements</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {topCoilDiffs.map((diff, index) => (
                      <BlockMeasurement
                        key={index}
                        value={diff}
                        onChange={(value) => handleDifferenceChange(topCoilDiffs, setTopCoilDiffs, index, value)}
                        referenceBlock={rawSteelData?.referenceBlock || 0}
                        specifications={rawSteelData?.processedMaterial?.height}
                        label={`Position ${index + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Bottom Coil Measurements</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {bottomCoilDiffs.map((diff, index) => (
                      <BlockMeasurement
                        key={index}
                        value={diff}
                        onChange={(value) => handleDifferenceChange(bottomCoilDiffs, setBottomCoilDiffs, index, value)}
                        referenceBlock={rawSteelData?.referenceBlock || 0}
                        specifications={rawSteelData?.processedMaterial?.height}
                        label={`Position ${index + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Complete Initial Test'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}