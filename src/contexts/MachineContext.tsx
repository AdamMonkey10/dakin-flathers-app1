import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { updateMachine } from '../lib/db';
import { useAuth } from './AuthContext';
import type { Machine, MachineProgress } from '../types';

interface MachineContextType {
  currentMachine: string | null;
  machines: Machine[];
  loading: boolean;
  error: string | null;
  setCurrentMachine: (id: string) => void;
  updateMachineProgress: (id: string, progress: Partial<MachineProgress>) => Promise<void>;
  clearMachineProgress: (id: string) => Promise<void>;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const [currentMachine, setCurrentMachine] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setMachines([]);
      setLoading(false);
      return;
    }

    const machinesRef = collection(db, 'dakinmachines');
    const q = query(machinesRef, orderBy('name'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const updatedMachines = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Machine[];
        setMachines(updatedMachines);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching machines:', err);
        setError('Failed to load machines');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const updateMachineProgress = async (id: string, progress: Partial<MachineProgress>) => {
    const machine = machines.find(m => m.id === id);
    if (!machine) return;

    await updateMachine(id, {
      progress: {
        ...machine.progress,
        ...progress
      }
    });
  };

  const clearMachineProgress = async (id: string) => {
    await updateMachine(id, {
      isActive: false,
      currentBatch: null,
      progress: {
        loadingSheet: false,
        preflightChecklist: false,
        initialTest: false,
        finalTest: false,
        finalChecklist: false
      }
    });
  };

  const value = {
    currentMachine,
    machines,
    loading,
    error,
    setCurrentMachine,
    updateMachineProgress,
    clearMachineProgress
  };

  return (
    <MachineContext.Provider value={value}>
      {children}
    </MachineContext.Provider>
  );
}

export function useMachine() {
  const context = useContext(MachineContext);
  if (context === undefined) {
    throw new Error('useMachine must be used within a MachineProvider');
  }
  return context;
}