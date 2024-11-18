import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  requiresInput?: boolean;
  inputValue?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: '1', text: 'COMPLETE LOADING SHEET', checked: false },
  { id: '2', text: 'COMPLETE BATCH SHEET', checked: false },
  { id: '3', text: 'SET TRAVEL (BACK IT OUT)', checked: false },
  { id: '4', text: 'CHANGE SPACER BLOCKS (IF NEEDED)', checked: false },
  { id: '5', text: 'CHANGE VICE (IF NEEDED)', checked: false },
  { id: '6', text: 'CHANGE DRESSER (IF NEEDED)', checked: false },
  { id: '7', text: 'DRESSER INDEX CARD COMPLETED', checked: false },
  { id: '8', text: 'INSPECT HAMMER CONDITION', checked: false },
  { id: '9', text: 'GRINDING WHEEL NUMBER(S)', checked: false, requiresInput: true },
  { id: '10', text: 'DRESS WHEEL', checked: false },
  { id: '11', text: 'SET INDEX (PITCH IF NEEDED)', checked: false, requiresInput: true },
  { id: '12', text: 'PULL STEEL THROUGH', checked: false },
  { id: '13', text: 'VICES SET', checked: false },
  { id: '14', text: 'HAMMERS SET/POSITION CORRECT', checked: false },
  { id: '15', text: 'CHECK ANGLE (PASSED IM)', checked: false },
  { id: '16', text: 'INDEX SET (PASSED IM)', checked: false },
  { id: '17', text: 'COMPLETE PROCESS SHEET', checked: false },
  { id: '18', text: 'TOOTH PROFILE SAVED TO M/SCOPE', checked: false },
  { id: '19', text: 'RUNNING', checked: false },
  { id: '20', text: 'CHECK TRAVEL', checked: false },
  { id: '21', text: 'SPEED SET', checked: false },
  { id: '22', text: 'OEE (Secs)', checked: false, requiresInput: true },
  { id: '23', text: 'ACTUAL (Secs)', checked: false, requiresInput: true },
  { id: '24', text: 'ALARMS SET', checked: false },
  { id: '25', text: 'LOAD ON TO RE-COILER', checked: false }
];

export default function AddBatchLog() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [error, setError] = useState('');

  const handleCheckItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
    setError('');
  };

  const handleInputChange = (id: string, value: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, inputValue: value } : item
    ));
    setError('');
  };

  const validateChecklist = () => {
    const allChecked = checklist.every(item => item.checked);
    const allInputsFilled = checklist
      .filter(item => item.requiresInput)
      .every(item => item.inputValue && item.inputValue.trim() !== '');

    if (!allChecked || !allInputsFilled) {
      setError('Please complete all steps and fill in all required values');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateChecklist()) return;

    localStorage.setItem('loadingSheetChecklist', JSON.stringify(checklist));
    navigate('/quality-control', { 
      state: { checklistCompleted: true }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
          <ClipboardCheck className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Loading Sheet Checklist</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleCheckItem(item.id)}
                className="mt-1.5 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-grow">
                <label className="text-gray-900 font-medium block">
                  {item.text}
                </label>
                {item.requiresInput && (
                  <input
                    type="text"
                    value={item.inputValue || ''}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                    className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter value..."
                    required
                  />
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-6 px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Complete Loading Sheet
          </button>
        </form>
      </div>
    </div>
  );
}