import React from 'react';

interface DecimalInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export default function DecimalInput({
  value,
  onChange,
  label,
  placeholder = "0.000",
  required = false
}: DecimalInputProps) {
  const displayValue = value === 0 ? '' : value.toString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
      
      if (inputValue === '' || !isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue !== '' && !isNaN(parseFloat(inputValue))) {
      const numValue = parseFloat(inputValue);
      onChange(Number(numValue.toFixed(4)));
    } else if (inputValue === '') {
      onChange(0);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        pattern="[0-9]*"
        step="0.0001"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}