// Update TestSheet.tsx to handle different test types
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { saveMeasurement, hasInitialTest } from '../lib/db';
import { useMachine } from '../contexts/MachineContext';
import ConfirmModal from '../components/ConfirmModal';

export default function TestSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMachine } = useMachine();
  const batchNumber = location.state?.batchNumber || '';
  const testType = location.pathname.includes('/initial') ? 'initial' : 'regular';
  
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [operator, setOperator] = useState('');
  const [result, setResult] = useState('');
  const [topCoil, setTopCoil] = useState<[string, string, string]>(['', '', '']);
  const [bottomCoil, setBottomCoil] = useState<[string, string, string]>(['', '', '']);
  const [microscopeChecks, setMicroscopeChecks] = useState({
    toothProfile: false,
    indexTooth: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (testType === 'initial') {
      // Check if initial test already exists
      if (hasInitialTest(batchNumber)) {
        navigate('/test-sheet');
      }
    }
  }, [testType, batchNumber]);

  // ... rest of your existing TestSheet code ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMeasurements() || !currentMachine) return;

    try {
      const newMeasurement = {
        operator,
        testType,
        result,
        topCoil,
        bottomCoil,
        microscopeChecks: testType === 'initial' ? microscopeChecks : undefined
      };

      await saveMeasurement(batchNumber, currentMachine, newMeasurement);

      if (testType === 'final') {
        navigate('/final-checklist', { 
          state: { batchNumber, machineId: currentMachine }
        });
      } else {
        // Clear form and stay on page for more tests
        setOperator('');
        setResult('');
        setTopCoil(['', '', '']);
        setBottomCoil(['', '', '']);
        setMicroscopeChecks({ toothProfile: false, indexTooth: false });
      }
    } catch (err) {
      console.error('Error saving measurement:', err);
      setError('Failed to save measurement');
    }
  };

  const handleFinalTest = () => {
    setShowFinalConfirm(true);
  };

  return (
    <Layout>
      {/* ... existing layout code ... */}
      
      {!testType === 'initial' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFinalTest}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Start Final Test
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showFinalConfirm}
        title="Start Final Test"
        message="Are you sure you want to start the final test? This will complete the testing phase for this batch."
        onClose={() => setShowFinalConfirm(false)}
        onConfirm={() => {
          setShowFinalConfirm(false);
          navigate('/test-sheet/final', { 
            state: { batchNumber, machineId: currentMachine }
          });
        }}
      />
    </Layout>
  );
}