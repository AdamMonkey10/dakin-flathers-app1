import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { updateBatch, getActiveBatch } from '../lib/db';
import { useMachine } from '../contexts/MachineContext';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
}

export default function PreflightChecklist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: machineId } = useParams();
  const { updateMachineProgress } = useMachine();
  
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'batch_sheet',
      text: 'COMPLETE BATCH SHEET',
      checked: false,
      required: true,
    },
    {
      id: 'check_angle',
      text: 'CHECK ANGLE (PASSED IM)',
      checked: false,
      required: true,
    },
    {
      id: 'index_set',
      text: 'INDEX SET (PASSED IM)',
      checked: false,
      required: true,
    },
    {
      id: 'complete_process',
      text: 'COMPLETE PROCESS SHEET',
      checked: false,
      required: true,
    },
    {
      id: 'tooth_profile',
      text: 'TOOTH PROFILE SAVED TO M/SCOPE',
      checked: false,
      required: true,
    },
    {
      id: 'check_travel',
      text: 'CHECK TRAVEL',
      checked: false,
      required: true,
    },
    {
      id: 'speed_set',
      text: 'SPEED SET',
      checked: false,
      required: true,
    },
    {
      id: 'alarms_set',
      text: 'ALARMS SET',
      checked: false,
      required: true,
    }
  ]);

  useEffect(() => {
    const loadBatchData = async () => {
      if (!machineId) return;

      try {
        const activeBatch = await getActiveBatch(machineId);
        if (!activeBatch) {
          throw new Error('No active batch found');
        }
        setBatchData(activeBatch);
      } catch (err: any) {
        console.error('Error loading batch:', err);
        setError(err.message || 'Failed to load batch data');
      } finally {
        setLoading(false);
      }
    };

    loadBatchData();
  }, [machineId]);

  const handleChecklistChange = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
    setError('');
  };

  const isChecklistComplete = () => {
    return checklist.every(item => !item.required || item.checked);
  };

  const handleComplete = async () => {
    if (!machineId || !batchData) {
      setError('Missing required information');
      return;
    }

    if (!isChecklistComplete()) {
      setError('Please complete all required items');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update batch status
      await updateBatch(batchData.id, {
        checklistComplete: true
      });

      // Update machine progress
      await updateMachineProgress(machineId, { 
        preflightChecklist: true 
      });

      // Navigate to initial test
      navigate(`/machine/${machineId}/initial-test`, { 
        state: { 
          batchNumber: batchData.batchNumber,
          batchId: batchData.id,
          machineId
        }
      });
    } catch (err: any) {
      console.error('Error completing checklist:', err);
      setError(err.message || 'Failed to complete checklist');
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
            <p className="text-gray-600">Loading checklist...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Machines
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pre-flight Checklist
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

          <div className="space-y-4">
            {checklist.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-grow pr-4">
                    <label className="text-gray-900 font-medium block text-lg">
                      {item.text}
                    </label>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleChecklistChange(item.id)}
                    className="h-6 w-6 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleComplete}
              disabled={!isChecklistComplete() || loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Complete Checklist'}
            </button>
            {!isChecklistComplete() && (
              <p className="mt-2 text-sm text-red-600 text-center">
                Please complete all required items before proceeding
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}