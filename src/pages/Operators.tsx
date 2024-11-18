import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Operator {
  id: string;
  name: string;
  createdAt: string;
}

export default function Operators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [newOperator, setNewOperator] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      const operatorsRef = collection(db, 'operators');
      const snapshot = await getDocs(operatorsRef);
      const loadedOperators = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Operator[];
      
      // Sort by name
      loadedOperators.sort((a, b) => a.name.localeCompare(b.name));
      setOperators(loadedOperators);
    } catch (err: any) {
      console.error('Error loading operators:', err);
      setError(err.message || 'Failed to load operators');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperator.trim()) return;

    try {
      const operatorsRef = collection(db, 'operators');
      await addDoc(operatorsRef, {
        name: newOperator.trim(),
        createdAt: new Date().toISOString()
      });

      setNewOperator('');
      await loadOperators();
    } catch (err: any) {
      console.error('Error adding operator:', err);
      setError(err.message || 'Failed to add operator');
    }
  };

  const handleDeleteOperator = async (operatorId: string) => {
    if (!confirm('Are you sure you want to delete this operator?')) return;

    try {
      await deleteDoc(doc(db, 'operators', operatorId));
      await loadOperators();
    } catch (err: any) {
      console.error('Error deleting operator:', err);
      setError(err.message || 'Failed to delete operator');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Operators</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAddOperator} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={newOperator}
                onChange={(e) => setNewOperator(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter operator name"
                required
              />
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Operator
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading operators...</p>
            </div>
          ) : operators.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No operators added yet</p>
          ) : (
            <div className="space-y-4">
              {operators.map((operator) => (
                <div
                  key={operator.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-lg font-medium text-gray-900">{operator.name}</span>
                  <button
                    onClick={() => handleDeleteOperator(operator.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}