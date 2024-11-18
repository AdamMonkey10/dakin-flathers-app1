import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OperatorSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function OperatorSelect({ value, onChange, required = false }: OperatorSelectProps) {
  const [operators, setOperators] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOperators = async () => {
      try {
        const operatorsRef = collection(db, 'operators');
        const snapshot = await getDocs(operatorsRef);
        const loadedOperators = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        
        // Sort by name
        loadedOperators.sort((a, b) => a.name.localeCompare(b.name));
        setOperators(loadedOperators);
      } catch (err) {
        console.error('Error loading operators:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOperators();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
        Loading operators...
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      required={required}
    >
      <option value="">Select operator...</option>
      {operators.map((operator) => (
        <option key={operator.id} value={operator.name}>
          {operator.name}
        </option>
      ))}
    </select>
  );
}