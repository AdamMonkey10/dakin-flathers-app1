import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, Save, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Form state
  const [sku, setSku] = useState('');
  const [referenceBlock, setReferenceBlock] = useState('');
  const [blockName, setBlockName] = useState('');
  
  // Raw Material specs
  const [rawHeightUSL, setRawHeightUSL] = useState('');
  const [rawHeightTarget, setRawHeightTarget] = useState('');
  const [rawHeightLSL, setRawHeightLSL] = useState('');
  const [rawGaugeUSL, setRawGaugeUSL] = useState('');
  const [rawGaugeTarget, setRawGaugeTarget] = useState('');
  const [rawGaugeLSL, setRawGaugeLSL] = useState('');
  
  // Processed Material specs
  const [processedHeightUSL, setProcessedHeightUSL] = useState('');
  const [processedHeightTarget, setProcessedHeightTarget] = useState('');
  const [processedHeightLSL, setProcessedHeightLSL] = useState('');
  const [processedGaugeUSL, setProcessedGaugeUSL] = useState('');
  const [processedGaugeTarget, setProcessedGaugeTarget] = useState('');
  const [processedGaugeLSL, setProcessedGaugeLSL] = useState('');

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleDecimalInput = (value: string, setter: (value: string) => void) => {
    if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
      setter(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) {
      setError('Please enter a SKU');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const rawSteelRef = doc(db, 'rawsteel', sku.trim());
      await setDoc(rawSteelRef, {
        name: sku.trim(),
        referenceBlock: parseFloat(referenceBlock) || 0,
        blockName: blockName.trim(),
        rawMaterial: {
          height: {
            usl: parseFloat(rawHeightUSL) || 0,
            target: parseFloat(rawHeightTarget) || 0,
            lsl: parseFloat(rawHeightLSL) || 0
          },
          gauge: {
            usl: parseFloat(rawGaugeUSL) || 0,
            target: parseFloat(rawGaugeTarget) || 0,
            lsl: parseFloat(rawGaugeLSL) || 0
          }
        },
        processedMaterial: {
          height: {
            usl: parseFloat(processedHeightUSL) || 0,
            target: parseFloat(processedHeightTarget) || 0,
            lsl: parseFloat(processedHeightLSL) || 0
          },
          gauge: {
            usl: parseFloat(processedGaugeUSL) || 0,
            target: parseFloat(processedGaugeTarget) || 0,
            lsl: parseFloat(processedGaugeLSL) || 0
          }
        },
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Block Name
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Block A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Block Value (inches)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.0001"
                  value={referenceBlock}
                  onChange={(e) => handleDecimalInput(e.target.value, setReferenceBlock)}
                  className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2.385"
                  required
                />
              </div>
            </div>

            {/* Raw Material Specifications */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Raw Material Specifications</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Height (inches)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">USL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={rawHeightUSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setRawHeightUSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2.385"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={rawHeightTarget}
                        onChange={(e) => handleDecimalInput(e.target.value, setRawHeightTarget)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2.380"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LSL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={rawHeightLSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setRawHeightLSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2.375"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Gauge (inches)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">USL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={rawGaugeUSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setRawGaugeUSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0.027"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={rawGaugeTarget}
                        onChange={(e) => handleDecimalInput(e.target.value, setRawGaugeTarget)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0.025"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LSL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={rawGaugeLSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setRawGaugeLSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0.023"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Processed Material Specifications */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Processed Material Specifications</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Height (inches)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">USL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={processedHeightUSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setProcessedHeightUSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2.385"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={processedHeightTarget}
                        onChange={(e) => handleDecimalInput(e.target.value, setProcessedHeightTarget)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2.380"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LSL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={processedHeightLSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setProcessedHeightLSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2.375"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Gauge (inches)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">USL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={processedGaugeUSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setProcessedGaugeUSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0.027"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={processedGaugeTarget}
                        onChange={(e) => handleDecimalInput(e.target.value, setProcessedGaugeTarget)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0.025"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LSL</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.0001"
                        value={processedGaugeLSL}
                        onChange={(e) => handleDecimalInput(e.target.value, setProcessedGaugeLSL)}
                        className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0.023"
                        required
                      />
                    </div>
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
              {loading ? 'Saving...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}