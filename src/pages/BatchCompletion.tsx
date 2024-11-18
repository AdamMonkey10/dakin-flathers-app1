import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, ClipboardCheck, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

interface FinalChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
}

export default function BatchCompletion() {
  const navigate = useNavigate();
  const [batchNumber, setBatchNumber] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [checklist, setChecklist] = useState<FinalChecklistItem[]>([
    {
      id: 'labels_attached',
      text: 'LABELS ATTACHED TO COILS',
      checked: false,
      required: true,
    },
    {
      id: 'quality_check',
      text: 'FINAL QUALITY CHECK COMPLETED',
      checked: false,
      required: true,
    },
    {
      id: 'documentation',
      text: 'ALL DOCUMENTATION COMPLETED',
      checked: false,
      required: true,
    },
    {
      id: 'packaging',
      text: 'PACKAGING REQUIREMENTS MET',
      checked: false,
      required: true,
    },
    {
      id: 'storage',
      text: 'MOVED TO CORRECT STORAGE LOCATION',
      checked: false,
      required: true,
    }
  ]);

  useEffect(() => {
    const savedBatchNumber = localStorage.getItem('currentBatchNumber');
    if (savedBatchNumber) {
      setBatchNumber(savedBatchNumber);
    }
  }, []);

  const handleChecklistChange = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  const isChecklistComplete = () => {
    return checklist.every(item => !item.required || item.checked);
  };

  const handleCompleteBatch = () => {
    if (isChecklistComplete()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmComplete = () => {
    setShowConfirmModal(false);
    setShowFinalConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    // Archive the batch data
    const batchData = {
      batchNumber,
      completedAt: new Date().toISOString(),
      measurements: localStorage.getItem('measurements'),
      loadingSheet: localStorage.getItem('currentLoadingSheet'),
      checklist: localStorage.getItem('checklist'),
      finalChecklist: checklist
    };

    // Get existing archive
    const archiveData = JSON.parse(localStorage.getItem('completedBatches') || '[]');
    archiveData.push(batchData);
    localStorage.setItem('completedBatches', JSON.stringify(archiveData));

    // Clear all current batch data
    localStorage.removeItem('currentBatchNumber');
    localStorage.removeItem('currentLoadingSheet');
    localStorage.removeItem('checklist');
    localStorage.removeItem('pendingBarcodes');
    localStorage.removeItem('measurements');
    
    // Navigate back to home
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 no-print">
          <Link
            to="/quality-control"
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Quality Control
          </Link>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Checklist
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:p-0">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Batch Completion Checklist</h2>
            <div className="text-sm text-gray-600 ml-4">Batch: {batchNumber}</div>
          </div>

          <div className="space-y-4">
            {checklist.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg print:bg-white print:p-2 print:border-b print:border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-grow pr-4">
                    <label className="text-gray-900 font-medium block text-lg">
                      {item.text}
                    </label>
                  </div>
                  <div className="print:text-2xl font-bold">
                    {item.checked ? '✓' : ''}
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleChecklistChange(item.id)}
                    className="h-6 w-6 text-blue-600 rounded focus:ring-blue-500 mt-1 no-print cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 no-print">
            <button
              onClick={handleCompleteBatch}
              disabled={!isChecklistComplete()}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Batch
            </button>
            {!isChecklistComplete() && (
              <p className="mt-2 text-sm text-red-600 text-center">
                Please complete all required items before proceeding
              </p>
            )}
          </div>
        </div>

        {/* Initial Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title="Complete Batch?"
          message="Are you sure you want to complete this batch? This action cannot be undone."
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmComplete}
        />

        {/* Final Confirmation Modal */}
        <ConfirmModal
          isOpen={showFinalConfirmModal}
          title="Final Confirmation"
          message={`This will permanently complete batch ${batchNumber} and clear all current data. Please confirm this action.`}
          onClose={() => setShowFinalConfirmModal(false)}
          onConfirm={handleFinalConfirm}
        />
      </div>
    </Layout>
  );
}