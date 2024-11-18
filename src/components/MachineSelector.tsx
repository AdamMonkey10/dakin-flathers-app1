import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMachine } from '../contexts/MachineContext';
import MachineCard from './MachineCard';
import { getActiveBatch } from '../lib/db';
import PreloadedBatchModal from './PreloadedBatchModal';

export default function MachineSelector() {
  const navigate = useNavigate();
  const { machines, setCurrentMachine } = useMachine();
  const [showPreloadedModal, setShowPreloadedModal] = React.useState(false);
  const [selectedMachineId, setSelectedMachineId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const getNextStep = async (machine: any) => {
    if (!machine.isActive) {
      return {
        path: `/machine/${machine.id}/loading-sheet`,
        state: null
      };
    }

    try {
      const activeBatch = await getActiveBatch(machine.id);
      if (!activeBatch) {
        return {
          path: `/machine/${machine.id}/loading-sheet`,
          state: null
        };
      }

      const { progress } = machine;
      if (!progress?.loadingSheet) {
        return {
          path: `/machine/${machine.id}/loading-sheet`,
          state: { batchNumber: activeBatch.batchNumber, batchId: activeBatch.id }
        };
      }
      if (!progress?.preflightChecklist) {
        return {
          path: `/machine/${machine.id}/checklist`,
          state: { batchNumber: activeBatch.batchNumber, batchId: activeBatch.id }
        };
      }
      if (!progress?.initialTest) {
        return {
          path: `/machine/${machine.id}/initial-test`,
          state: { batchNumber: activeBatch.batchNumber, batchId: activeBatch.id }
        };
      }
      if (!progress?.finalTest) {
        return {
          path: `/machine/${machine.id}/test`,
          state: { batchNumber: activeBatch.batchNumber, batchId: activeBatch.id }
        };
      }
      if (!progress?.finalChecklist) {
        return {
          path: `/machine/${machine.id}/final-checklist`,
          state: { batchNumber: activeBatch.batchNumber, batchId: activeBatch.id }
        };
      }
      return {
        path: `/machine/${machine.id}/loading-sheet`,
        state: null
      };
    } catch (error) {
      console.error('Error getting next step:', error);
      return {
        path: `/machine/${machine.id}/loading-sheet`,
        state: null
      };
    }
  };

  const handleMachineClick = async (machine: any) => {
    if (machine.isActive) {
      setCurrentMachine(machine.id);
      const nextStep = await getNextStep(machine);
      navigate(nextStep.path, { state: nextStep.state });
    } else {
      setSelectedMachineId(machine.id);
      setShowPreloadedModal(true);
    }
  };

  const handleStartNew = () => {
    if (selectedMachineId) {
      setCurrentMachine(selectedMachineId);
      navigate(`/machine/${selectedMachineId}/loading-sheet`);
    }
    setShowPreloadedModal(false);
  };

  const handleUsePreloaded = async (batch: any) => {
    if (!selectedMachineId) return;

    setLoading(true);
    try {
      setCurrentMachine(selectedMachineId);
      navigate(`/machine/${selectedMachineId}/loading-sheet`, {
        state: { 
          preloadedBatch: batch,
          batchNumber: batch.batchNumber,
          sku: batch.sku,
          operator: batch.operator,
          coils: batch.coils || [{ id: 1, height: '', gauge: '' }],
          specifications: batch.specifications
        }
      });
    } catch (error) {
      console.error('Error using preloaded batch:', error);
    } finally {
      setLoading(false);
      setShowPreloadedModal(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            {...machine}
            onClick={() => handleMachineClick(machine)}
          />
        ))}
      </div>

      <PreloadedBatchModal
        isOpen={showPreloadedModal}
        onClose={() => setShowPreloadedModal(false)}
        batches={[]}
        onStartNew={handleStartNew}
        onUsePreloaded={handleUsePreloaded}
        loading={loading}
      />
    </>
  );
}