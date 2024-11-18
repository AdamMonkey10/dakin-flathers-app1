import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, Plus, Trash2, Play } from 'lucide-react';
import { getPreloadedBatches, removePreloadedBatch } from '../lib/db';
import { useNavigate } from 'react-router-dom';
import { useMachine } from '../contexts/MachineContext';
import { Timestamp } from 'firebase/firestore';

interface PreloadedBatch {
  id: string;
  batchNumber: string;
  sku: string;
  operator: string;
  createdAt: Timestamp;
  status: string;
  coils?: Array<{ id: number; height: string; gauge: string }>;
  specifications?: any;
}

export default function PreloadedBatches() {
  const navigate = useNavigate();
  const { machines } = useMachine();
  const [batches, setBatches] = useState<PreloadedBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const preloadedBatches = await getPreloadedBatches();
      setBatches(preloadedBatches);
    } catch (err: any) {
      console.error('Error loading preloaded batches:', err);
      setError(err.message || 'Failed to load preloaded batches');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to remove this preloaded batch?')) return;

    try {
      await removePreloadedBatch(batchId);
      await loadBatches();
      setSelectedBatch(null);
    } catch (err: any) {
      console.error('Error removing batch:', err);
      setError(err.message || 'Failed to remove batch');
    }
  };

  const handleStartBatch = (machineId: string, batch: PreloadedBatch) => {
    navigate(`/machine/${machineId}/loading-sheet`, {
      state: { 
        preloadedBatch: batch,
        batchNumber: batch.batchNumber,
        sku: batch.sku,
        operator: batch.operator,
        coils: batch.coils || [{ id: 1, height: '', gauge: '' }],
        specifications: batch.specifications
      }
    });
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    });
  };

  // Filter available machines (not currently running a batch)
  const availableMachines = machines.filter(m => !m.isActive);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preloaded Batches</h1>
            <p className="mt-2 text-gray-600">View and manage preloaded production batches</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/preload')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Pre-Load New Batch
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading preloaded batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No preloaded batches available</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className={`bg-white rounded-lg shadow-sm p-6 border transition-colors ${
                  selectedBatch === batch.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
                onClick={() => setSelectedBatch(batch.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Batch: {batch.batchNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">SKU: {batch.sku}</p>
                    <p className="text-sm text-gray-600">Operator: {batch.operator}</p>
                    {batch.createdAt && (
                      <p className="text-sm text-gray-500 mt-2">
                        Created: {formatDate(batch.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBatch(batch.id);
                      }}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      title="Remove Batch"
                    >
                      <Trash2 className="w-5 w-5" />
                    </button>
                  </div>
                </div>

                {selectedBatch === batch.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Select Machine to Start Batch
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {availableMachines.length === 0 ? (
                        <p className="col-span-2 text-center text-sm text-gray-500 py-2">
                          No machines available. Please wait for a machine to become idle.
                        </p>
                      ) : (
                        availableMachines.map((machine) => (
                          <button
                            key={machine.id}
                            onClick={() => handleStartBatch(machine.id, batch)}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                          >
                            <span className="font-medium text-gray-900">{machine.name}</span>
                            <Play className="w-4 h-4 text-blue-600" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}