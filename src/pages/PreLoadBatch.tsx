import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, Plus, AlertCircle } from 'lucide-react';
import { addToQueue, getRawSteelBySKU } from '../lib/db';
import { useMachine } from '../contexts/MachineContext';
import OperatorSelect from '../components/OperatorSelect';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CoilData {
  id: number;
  height: string;
  gauge: string;
}

export default function PreLoadBatch() {
  const navigate = useNavigate();
  const { machines } = useMachine();
  
  const [batchNumber, setBatchNumber] = useState('');
  const [sku, setSku] = useState('');
  const [operator, setOperator] = useState('');
  const [coils, setCoils] = useState<CoilData[]>([{ id: 1, height: '', gauge: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maxDifference, setMaxDifference] = useState<number | null>(null);
  const [specifications, setSpecifications] = useState<any>(null);
  const [rawSteelOptions, setRawSteelOptions] = useState<any[]>([]);

  // Load raw steel options
  useEffect(() => {
    const loadRawSteelOptions = async () => {
      try {
        const rawSteelRef = collection(db, 'rawsteel');
        const snapshot = await getDocs(rawSteelRef);
        const options = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRawSteelOptions(options);
      } catch (err) {
        console.error('Error fetching raw steel options:', err);
        setError('Failed to load raw material options');
      }
    };

    loadRawSteelOptions();
  }, []);

  // Load specifications when SKU changes
  useEffect(() => {
    const loadSpecifications = async () => {
      if (!sku) {
        setSpecifications(null);
        return;
      }

      try {
        const rawSteel = await getRawSteelBySKU(sku);
        if (rawSteel) {
          setSpecifications(rawSteel.rawMaterial);
        }
      } catch (err) {
        console.error('Error loading specifications:', err);
      }
    };

    loadSpecifications();
  }, [sku]);

  // Calculate height differences
  useEffect(() => {
    const heights = coils.map(coil => parseFloat(coil.height)).filter(h => !isNaN(h));
    if (heights.length >= 2) {
      const max = Math.max(...heights);
      const min = Math.min(...heights);
      setMaxDifference(max - min);
    } else {
      setMaxDifference(null);
    }
  }, [coils]);

  const handleCoilChange = (id: number, field: string, value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCoils(prevCoils => prevCoils.map(coil => 
        coil.id === id ? { ...coil, [field]: value } : coil
      ));
    }
  };

  const addCoil = () => {
    setCoils(prev => [...prev, { id: prev.length + 1, height: '', gauge: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim() || !sku.trim() || !operator.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (coils.some(coil => !coil.height || !coil.gauge)) {
      setError('Please fill in all coil measurements');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Add to preloaded queue
      const queueData = {
        batchNumber: batchNumber.trim(),
        sku: sku.trim(),
        loadingSheetComplete: true,
        status: 'pending',
        operator,
        coils,
        specifications,
        createdAt: new Date().toISOString()
      };

      await addToQueue(queueData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error pre-loading batch:', err);
      setError(err.message || 'Failed to pre-load batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pre-Load Batch</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raw Material
                </label>
                <select
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select SKU</option>
                  {rawSteelOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

            {specifications && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Height (inches)</p>
                    <p className="text-xs text-blue-600">
                      LSL: {specifications.height.lsl} | Target: {specifications.height.target} | USL: {specifications.height.usl}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Gauge (inches)</p>
                    <p className="text-xs text-blue-600">
                      LSL: {specifications.gauge.lsl} | Target: {specifications.gauge.target} | USL: {specifications.gauge.usl}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Coil Measurements</h3>
                <button
                  type="button"
                  onClick={addCoil}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coil
                </button>
              </div>

              {maxDifference !== null && (
                <div className={`p-4 rounded-lg ${
                  maxDifference > 0.002 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  <p className="font-medium">
                    Maximum Height Difference: {maxDifference.toFixed(4)}"
                  </p>
                </div>
              )}
              
              {coils.map((coil) => (
                <div key={coil.id} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Coil {coil.id}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (inches)
                    </label>
                    <input
                      type="text"
                      value={coil.height}
                      onChange={(e) => handleCoilChange(coil.id, 'height', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        coil.height && specifications?.height ? (
                          parseFloat(coil.height) >= specifications.height.lsl &&
                          parseFloat(coil.height) <= specifications.height.usl
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                        ) : ''
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gauge (inches)
                    </label>
                    <input
                      type="text"
                      value={coil.gauge}
                      onChange={(e) => handleCoilChange(coil.id, 'gauge', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        coil.gauge && specifications?.gauge ? (
                          parseFloat(coil.gauge) >= specifications.gauge.lsl &&
                          parseFloat(coil.gauge) <= specifications.gauge.usl
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                        ) : ''
                      }`}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              {loading ? 'Pre-Loading...' : 'Pre-Load Batch'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}