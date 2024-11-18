import React from 'react';

interface Measurement {
  id: number;
  timestamp: string;
  topCoil: [string, string, string];
  bottomCoil: [string, string, string];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  measurement: Measurement | null;
}

export default function Modal({ isOpen, onClose, onConfirm, title, message, measurement }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {measurement && (
          <div className="mb-4">
            <div className="mb-3">
              <p className="font-medium">Top Coil Heights:</p>
              <p className="text-gray-600">{measurement.topCoil.join(' | ')}</p>
            </div>
            <div>
              <p className="font-medium">Bottom Coil Heights:</p>
              <p className="text-gray-600">{measurement.bottomCoil.join(' | ')}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}