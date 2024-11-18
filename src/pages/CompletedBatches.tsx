import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, Calendar, Search, FileText } from 'lucide-react';
import { getCompletedBatches } from '../lib/db';
import type { CompletedBatch } from '../types';

export default function CompletedBatches() {
  const [batches, setBatches] = useState<CompletedBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const completedBatches = await getCompletedBatches();
        setBatches(completedBatches);
      } catch (err: any) {
        setError(err.message || 'Failed to load completed batches');
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  const filteredBatches = batches.filter(batch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (batch.batchNumber?.toLowerCase() || '').includes(searchLower) ||
      (batch.sku?.toLowerCase() || '').includes(searchLower) ||
      (batch.machineId?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Completed Batches</h1>
              <p className="mt-2 text-gray-600">View and analyze completed production batches</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by batch number, SKU, or machine..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading completed batches...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Batch: {batch.batchNumber || 'N/A'}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Machine {batch.machineId || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        SKU: {batch.sku || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {batch.completedAt ? new Date(batch.completedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Loading Sheet</p>
                      <p className="font-medium text-gray-900">Complete</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/batch/${batch.id}/report`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Report
                    </Link>
                  </div>
                </div>
              ))}

              {filteredBatches.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm ? 'No batches match your search' : 'No completed batches found'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}