import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, FileText, Download, Database } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getQCAnalysisBySKU } from '../lib/qcService';
import { exportAnalysis, exportBatchData } from '../lib/api';
import HeightDistributionChart from '../components/charts/HeightDistributionChart';
import ProcessCapabilityChart from '../components/charts/ProcessCapabilityChart';

export default function BatchReport() {
  const { id } = useParams();
  const [batchData, setBatchData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadBatchData = async () => {
      if (!id) return;

      try {
        const batchRef = doc(db, 'batches', id);
        const batchDoc = await getDoc(batchRef);
        
        if (!batchDoc.exists()) {
          throw new Error('Batch not found');
        }

        const data = { id: batchDoc.id, ...batchDoc.data() };
        setBatchData(data);

        // Get QC analysis for this batch
        const analysisData = await getQCAnalysisBySKU(data.sku, undefined, id);
        setAnalysis(analysisData);
      } catch (err: any) {
        console.error('Error loading batch:', err);
        setError(err.message || 'Failed to load batch data');
      } finally {
        setLoading(false);
      }
    };

    loadBatchData();
  }, [id]);

  const handleExportCSV = async () => {
    if (!analysis || !batchData) return;

    setExporting(true);
    try {
      const data = exportAnalysis(analysis, batchData.sku, id);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batchData.batchNumber}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      setError(error.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!id || !batchData) return;
    
    try {
      const data = await exportBatchData(id);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batchData.batchNumber}-full-data.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting JSON:', error);
      setError(error.message || 'Failed to export batch data');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !batchData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-red-700">{error || 'Failed to load batch data'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/completed-batches" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Completed Batches
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">
              Batch Report: {batchData.batchNumber}
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Database className="h-5 w-5 mr-2" />
              Export Full Data
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-5 w-5 mr-2" />
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">SKU</dt>
                <dd className="text-base font-medium text-gray-900">{batchData.sku}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Machine</dt>
                <dd className="text-base font-medium text-gray-900">{batchData.machineName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Completion Date</dt>
                <dd className="text-base font-medium text-gray-900">
                  {new Date(batchData.completedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Test Summary</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Total Tests</dt>
                <dd className="text-base font-medium text-gray-900">{analysis?.totalMeasurements || 0}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Pass Rate</dt>
                <dd className="text-base font-medium text-gray-900">
                  {((analysis?.passRate || 0) * 100).toFixed(1)}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Process Capability</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Cp (Process Capability)</dt>
                <dd className="text-base font-medium text-gray-900">
                  {analysis?.topCoilStats?.cp?.toFixed(2) || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Cpk (Process Capability Index)</dt>
                <dd className="text-base font-medium text-gray-900">
                  {analysis?.topCoilStats?.cpk?.toFixed(2) || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {analysis && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <HeightDistributionChart
                data={analysis.topCoilStats.measurements}
                specifications={analysis.specifications}
                title="Top Coil Height Distribution"
                color="#3b82f6"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <HeightDistributionChart
                data={analysis.bottomCoilStats.measurements}
                specifications={analysis.specifications}
                title="Bottom Coil Height Distribution"
                color="#10b981"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProcessCapabilityChart
                data={analysis.topCoilStats.measurements}
                specifications={analysis.specifications}
                title="Top Coil Process Control"
                color="#3b82f6"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProcessCapabilityChart
                data={analysis.bottomCoilStats.measurements}
                specifications={analysis.specifications}
                title="Bottom Coil Process Control"
                color="#10b981"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}