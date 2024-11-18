import React from 'react';
import { X, Plus, Loader2, ArrowRightLeft, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreloadedBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: any[];
  onStartNew: () => void;
  onUsePreloaded: (batch: any) => void;
  onTransferBatch?: (batch: any, newMachineId: string) => void;
  loading?: boolean;
}

export default function PreloadedBatchModal({
  isOpen,
  onClose,
  batches,
  onStartNew,
  onUsePreloaded,
  loading = false
}: PreloadedBatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Start New Batch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Available Options</h3>
            <p className="text-sm text-blue-700">
              Start a new batch or view preloaded batches.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onStartNew}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Start New Batch
                </>
              )}
            </button>

            <Link
              to="/preloaded-batches"
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ListFilter className="h-5 w-5 mr-2" />
              View Preloaded Batches
            </Link>
          </div>

          {batches.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Recent Preloaded Batches
              </h3>
              <div className="space-y-3">
                {batches.slice(0, 3).map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Batch: {batch.batchNumber}</p>
                        <p className="text-sm text-gray-600 mt-1">SKU: {batch.sku}</p>
                      </div>
                      <button
                        onClick={() => onUsePreloaded(batch)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
                {batches.length > 3 && (
                  <Link
                    to="/preloaded-batches"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all {batches.length} preloaded batches
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}