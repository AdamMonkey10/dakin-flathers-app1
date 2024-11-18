import React from 'react';
import Layout from '../components/Layout';
import MachineSelector from '../components/MachineSelector';
import { Plus, FileText, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useMachine } from '../contexts/MachineContext';

export default function Home() {
  const navigate = useNavigate();
  const { loading, error } = useMachine();

  const handlePreloadBatch = () => {
    navigate('/preload');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading machines...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Machine Status</h1>
            <p className="mt-2 text-gray-600">Monitor and manage production machines</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/add-product"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-5 w-5 mr-2" />
              Add Product
            </Link>
            <button
              onClick={handlePreloadBatch}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Pre-Load Batch
            </button>
            <Link
              to="/completed-batches"
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              View Completed Batches
            </Link>
          </div>
        </div>

        <MachineSelector />
      </div>
    </Layout>
  );
}