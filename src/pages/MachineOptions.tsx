import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, Plus, List } from 'lucide-react';
import { useMachine } from '../contexts/MachineContext';

export default function MachineOptions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machines, setCurrentMachine } = useMachine();
  const machine = machines.find(m => m.id === id);

  React.useEffect(() => {
    if (id) {
      setCurrentMachine(id);
    }
  }, [id]);

  if (!machine) {
    return <Navigate to="/" />;
  }

  const handleStartNewBatch = () => {
    navigate(`/machine/${id}/loading-sheet`);
  };

  const handlePreLoadBatch = () => {
    navigate(`/machine/${id}/preload`);
  };

  const getNextStep = () => {
    if (!machine.progress) return '/loading-sheet';
    if (!machine.progress.loadingSheet) return '/loading-sheet';
    if (!machine.progress.preflightChecklist) return '/checklist';
    if (!machine.progress.initialTest) return '/initial-test';
    if (!machine.progress.finalTest) return '/test';
    if (!machine.progress.finalChecklist) return '/final-checklist';
    return '/';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <Home className="w-4 h-4 mr-2" />
            Back to Machines
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {machine.name} - {machine.status === 'idle' ? 'Start New Batch' : 'Continue Batch'}
          </h2>

          {machine.status === 'idle' ? (
            <div className="space-y-4">
              <button
                onClick={handleStartNewBatch}
                className="w-full flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start New Batch
              </button>

              <button
                onClick={handlePreLoadBatch}
                className="w-full flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <List className="w-5 h-5 mr-2" />
                Pre-Load Batch
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Current Batch: {machine.currentBatch}</p>
                <p className="text-sm text-blue-700 mt-1">Continue from where you left off</p>
              </div>
              <button
                onClick={() => navigate(`/machine/${id}${getNextStep()}`)}
                className="w-full flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue Batch
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}