import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, Download } from 'lucide-react';
import { getQCAnalysisBySKU, getBatchesBySKU } from '../lib/qcService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { exportAnalysis } from '../lib/api';
import HeightDistributionChart from '../components/charts/HeightDistributionChart';
import ProcessCapabilityChart from '../components/charts/ProcessCapabilityChart';

export default function PerformanceMetrics() {
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [skuOptions, setSkuOptions] = useState<{ id: string; name: string }[]>([]);
  const [batchOptions, setBatchOptions] = useState<{ id: string; batchNumber: string }[]>([]);
  const [specifications, setSpecifications] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Load SKU options
  useEffect(() => {
    const loadSKUs = async () => {
      try {
        const rawSteelRef = collection(db, 'rawsteel');
        const snapshot = await getDocs(rawSteelRef);
        const options = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setSkuOptions(options);
      } catch (err) {
        console.error('Error loading SKUs:', err);
        setError('Failed to load SKU options');
      }
    };

    loadSKUs();
  }, []);

  // Load batch options when SKU changes
  useEffect(() => {
    const loadBatches = async () => {
      if (!selectedSKU) {
        setBatchOptions([]);
        return;
      }

      try {
        const batches = await getBatchesBySKU(selectedSKU);
        setBatchOptions(batches);
      } catch (err) {
        console.error('Error loading batches:', err);
        setError('Failed to load batch options');
      }
    };

    loadBatches();
  }, [selectedSKU]);

  // Load analysis when SKU or batch changes
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!selectedSKU) {
        setAnalysis(null);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Get specifications from rawsteel collection
        const rawSteelRef = collection(db, 'rawsteel');
        const snapshot = await getDocs(rawSteelRef);
        const rawSteelDoc = snapshot.docs.find(doc => doc.id === selectedSKU);
        
        if (rawSteelDoc) {
          const specs = rawSteelDoc.data().processedMaterial?.height;
          setSpecifications(specs);

          const data = await getQCAnalysisBySKU(
            selectedSKU,
            specs,
            selectedBatch || undefined
          );
          setAnalysis(data);
        }
      } catch (err: any) {
        console.error('Error loading analysis:', err);
        setError(err.message || 'Failed to load analysis');
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [selectedSKU, selectedBatch]);

  const handleExportCSV = () => {
    if (!analysis || !selectedSKU) {
      setError('No analysis data available for export');
      return;
    }

    setExporting(true);
    try {
      const data = exportAnalysis(analysis, selectedSKU, selectedBatch);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      const filename = `analysis-${selectedSKU}${selectedBatch ? `-${selectedBatch}` : ''}.csv`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting analysis:', error);
      setError(error.message || 'Failed to export analysis');
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num: number) => num.toFixed(4);
  const formatPercent = (num: number) => (num * 100).toFixed(1) + '%';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
              <p className="mt-2 text-gray-600">Quality control analysis and process capability</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleExportCSV}
                disabled={!analysis || exporting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-5 w-5 mr-2" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raw Material (SKU)
                </label>
                <select
                  value={selectedSKU}
                  onChange={(e) => {
                    setSelectedSKU(e.target.value);
                    setSelectedBatch('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select SKU</option>
                  {skuOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch (Optional)
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedSKU}
                >
                  <option value="">All Batches</option>
                  {batchOptions.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analysis...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600">Total Measurements</p>
                  <p className="text-2xl font-bold text-gray-900">{analysis.totalMeasurements}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercent(analysis.passRate)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600">Batch Count</p>
                  <p className="text-2xl font-bold text-gray-900">{analysis.batchCount}</p>
                </div>

                {specifications && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <p className="text-sm font-medium text-gray-600">Specifications</p>
                    <div className="mt-1 text-sm">
                      <p>Target: {specifications.target.toFixed(4)}"</p>
                      <p>LSL: {specifications.lsl.toFixed(4)}"</p>
                      <p>USL: {specifications.usl.toFixed(4)}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-8">
                {/* Height Distribution Charts */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <HeightDistributionChart
                    data={analysis.topCoilStats.measurements || []}
                    specifications={specifications}
                    title="Top Coil Height Distribution"
                    color="#3b82f6"
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <HeightDistributionChart
                    data={analysis.bottomCoilStats.measurements || []}
                    specifications={specifications}
                    title="Bottom Coil Height Distribution"
                    color="#10b981"
                  />
                </div>

                {/* Process Control Charts */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <ProcessCapabilityChart
                    data={analysis.topCoilStats.measurements || []}
                    specifications={specifications}
                    title="Top Coil Process Control"
                    color="#3b82f6"
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <ProcessCapabilityChart
                    data={analysis.bottomCoilStats.measurements || []}
                    specifications={specifications}
                    title="Bottom Coil Process Control"
                    color="#10b981"
                  />
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Coil Analysis */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Coil Analysis</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mean Height</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.topCoilStats.mean)}"
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Standard Deviation</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.topCoilStats.stdDev)}"
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Minimum</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.topCoilStats.min)}"
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Maximum</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.topCoilStats.max)}"
                        </p>
                      </div>
                    </div>
                    {analysis.topCoilStats.cp !== undefined && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Process Capability (Cp)</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {analysis.topCoilStats.cp.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Process Capability Index (Cpk)</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {analysis.topCoilStats.cpk.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Coil Analysis */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bottom Coil Analysis</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mean Height</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.bottomCoilStats.mean)}"
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Standard Deviation</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.bottomCoilStats.stdDev)}"
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Minimum</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.bottomCoilStats.min)}"
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Maximum</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatNumber(analysis.bottomCoilStats.max)}"
                        </p>
                      </div>
                    </div>
                    {analysis.bottomCoilStats.cp !== undefined && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Process Capability (Cp)</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {analysis.bottomCoilStats.cp.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Process Capability Index (Cpk)</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {analysis.bottomCoilStats.cpk.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a SKU above to view analysis
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}