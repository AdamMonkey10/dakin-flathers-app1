import React from 'react';

interface ChecklistItemProps {
  id: string;
  text: string;
  completed: boolean;
  requiresInput?: boolean;
  inputLabel?: string;
  inputValue?: string;
  onCheck: (id: string) => void;
  onInputChange: (id: string, value: string) => void;
}

export default function ChecklistItem({
  id,
  text,
  completed,
  requiresInput,
  inputLabel,
  inputValue,
  onCheck,
  onInputChange
}: ChecklistItemProps) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onCheck(id)}
        className="mt-1.5 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <div className="flex-grow">
        <label className="text-gray-900 font-medium block">
          {text}
        </label>
        {requiresInput && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(id, e.target.value)}
            placeholder={inputLabel}
            className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        )}
      </div>
    </div>
  );
}