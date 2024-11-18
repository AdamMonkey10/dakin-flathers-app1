import React from 'react';
import Layout from '../components/Layout';
import AddBatchLog from '../components/BatchLog/AddBatchLog';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DakinFlathers() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-4 mb-4">
        {/* Back to Home Button */}
        <div className="mb-4 flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Loading Sheet & Coil Tracking
          </h1>
        </div>

        {/* AddBatchLog Component */}
        <div className="mt-8">
          <AddBatchLog />
        </div>
      </div>
    </Layout>
  );
}