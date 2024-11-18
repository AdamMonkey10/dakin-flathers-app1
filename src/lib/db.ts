import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  getDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Machine, MachineProgress, BatchQueue, Batch, QCData } from '../types';

// Update machine status
export const updateMachine = async (machineId: string, updates: Partial<Machine>) => {
  try {
    const machineRef = doc(db, 'dakinmachines', machineId);
    await updateDoc(machineRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    throw error;
  }
};

// Create new batch
export const createNewBatch = async (
  batchNumber: string, 
  sku: string, 
  machineId: string,
  pre: boolean = false
) => {
  try {
    const machineRef = doc(db, 'dakinmachines', machineId);
    const machineDoc = await getDoc(machineRef);
    
    if (!machineDoc.exists()) {
      throw new Error('Machine not found');
    }

    const machineData = machineDoc.data() as Machine;
    const { name: machineName } = machineData;

    // Use batch number as document ID
    const batchRef = doc(db, 'batches', batchNumber);
    await setDoc(batchRef, {
      batchNumber,
      sku,
      machineId: machineName,
      machineDocId: machineId,
      pre,
      isActive: true,
      startedAt: serverTimestamp()
    });

    await updateMachine(machineId, {
      isActive: true,
      currentBatch: batchNumber,
      pre,
      progress: {
        loadingSheet: false,
        preflightChecklist: false,
        initialTest: false,
        finalTest: false,
        finalChecklist: false
      }
    });

    return batchNumber;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

// Save loading sheet
export const saveLoadingSheet = async (batchId: string, machineId: string, data: any) => {
  try {
    const batchRef = doc(db, 'batches', batchId);
    await updateDoc(batchRef, {
      loadingSheetData: {
        ...data,
        createdAt: serverTimestamp()
      },
      loadingSheetComplete: true
    });

    await updateMachine(machineId, {
      progress: {
        loadingSheet: true
      }
    });
  } catch (error) {
    console.error('Error saving loading sheet:', error);
    throw error;
  }
};

// Get raw steel by SKU
export const getRawSteelBySKU = async (sku: string) => {
  try {
    const rawSteelRef = doc(db, 'rawsteel', sku);
    const rawSteelDoc = await getDoc(rawSteelRef);
    if (rawSteelDoc.exists()) {
      return rawSteelDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting raw steel:', error);
    throw error;
  }
};

// Get preloaded batches
export const getPreloadedBatches = async () => {
  try {
    const batchesRef = collection(db, 'preloadedBatches');
    const q = query(
      batchesRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting preloaded batches:', error);
    throw error;
  }
};

// Remove preloaded batch
export const removePreloadedBatch = async (batchId: string) => {
  try {
    const batchRef = doc(db, 'preloadedBatches', batchId);
    await deleteDoc(batchRef);
  } catch (error) {
    console.error('Error removing preloaded batch:', error);
    throw error;
  }
};

// Add to queue
export const addToQueue = async (data: Omit<BatchQueue, 'id'>) => {
  try {
    const queueRef = doc(db, 'preloadedBatches', data.batchNumber);
    await setDoc(queueRef, {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return data.batchNumber;
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
};

// Save measurement
export const saveMeasurement = async (batchId: string, machineId: string, data: any) => {
  try {
    const measurementsRef = collection(db, 'measurements');
    await addDoc(measurementsRef, {
      batchId,
      machineId,
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving measurement:', error);
    throw error;
  }
};

// Save test data
export const saveTestData = async (data: Omit<QCData, 'id' | 'createdAt'>) => {
  try {
    const measurementsRef = collection(db, 'measurements');
    await addDoc(measurementsRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving test data:', error);
    throw error;
  }
};

// Update batch
export const updateBatch = async (batchId: string, updates: any) => {
  try {
    const batchRef = doc(db, 'batches', batchId);
    await updateDoc(batchRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    throw error;
  }
};

// Get active batch
export const getActiveBatch = async (machineId: string) => {
  try {
    const batchesRef = collection(db, 'batches');
    const q = query(
      batchesRef,
      where('machineDocId', '==', machineId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting active batch:', error);
    throw error;
  }
};

// Get completed batches
export const getCompletedBatches = async () => {
  try {
    const batchesRef = collection(db, 'batches');
    const q = query(
      batchesRef,
      where('isActive', '==', false),
      orderBy('completedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      machineName: doc.data().machineId || 'Unknown Machine'
    }));
  } catch (error) {
    console.error('Error getting completed batches:', error);
    throw error;
  }
};