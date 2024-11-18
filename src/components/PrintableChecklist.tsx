import React from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
  hasInput?: boolean;
  inputs?: {
    id: string;
    placeholder: string;
    value: string;
  }[];
}

interface PrintableChecklistProps {
  checklist: ChecklistItem[];
  date: string;
}

export default function PrintableChecklist({ checklist, date }: PrintableChecklistProps) {
  return (
    <div className="p-8 print:p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Pre-flight Checklist Report</h1>
        <p className="text-gray-600">Dakin Flathers</p>
        <p className="text-gray-600 mt-2">Date: {date}</p>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Task</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Values</th>
          </tr>
        </thead>
        <tbody>
          {checklist.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 px-4 py-2">
                {item.text}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {item.checked ? '✓' : '✗'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.hasInput && item.inputs && item.inputs.map(input => (
                  <span key={input.id} className="mr-4">
                    {input.id}: {input.value}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-sm text-gray-500">
        <p>Generated on: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}