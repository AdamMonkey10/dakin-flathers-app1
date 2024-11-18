import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { QCData, QCAnalysis } from '../types';

// Helper function to safely format numbers
const safeNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  return num.toFixed(4);
};

// Helper function to escape CSV values
const escapeValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Convert measurements to CSV format
const convertToCSV = (measurements: QCData[]): string => {
  const headers = [
    'Timestamp',
    'Operator',
    'Test Type',
    'Result',
    'Top Coil 1',
    'Top Coil 2',
    'Top Coil 3',
    'Bottom Coil 1',
    'Bottom Coil 2',
    'Bottom Coil 3',
    'SKU',
    'Batch ID'
  ];

  const rows = measurements.map(m => {
    const timestamp = m.createdAt?.toDate?.() 
      ? new Date(m.createdAt.toDate()).toLocaleString()
      : new Date().toLocaleString();

    const topCoilHeights = (m.topCoilData || []).map(d => safeNumber(parseFloat(d?.height || '')));
    const bottomCoilHeights = (m.bottomCoilData || []).map(d => safeNumber(parseFloat(d?.height || '')));

    while (topCoilHeights.length < 3) topCoilHeights.push('N/A');
    while (bottomCoilHeights.length < 3) bottomCoilHeights.push('N/A');

    return [
      timestamp,
      m.operator || 'N/A',
      m.testType || 'N/A',
      m.result || 'N/A',
      ...topCoilHeights,
      ...bottomCoilHeights,
      m.sku || 'N/A',
      m.batchId || 'N/A'
    ];
  });

  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeValue).join(','))
  ].join('\n');
};

// Export measurements for a batch
export const exportMeasurements = async (batchId: string): Promise<Blob> => {
  try {
    if (!batchId) {
      throw new Error('Batch ID is required');
    }

    const measurementsRef = collection(db, 'measurements');
    const q = query(measurementsRef, where('batchId', '==', batchId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('No measurements found for this batch');
    }

    const measurements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QCData[];

    const csv = convertToCSV(measurements);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  } catch (error: any) {
    console.error('Error exporting measurements:', error);
    throw error;
  }
};

// Convert analysis results to CSV format
const convertAnalysisToCSV = (analysis: QCAnalysis, sku: string, batchId?: string): string => {
  if (!analysis || !analysis.topCoilStats || !analysis.bottomCoilStats) {
    throw new Error('Invalid analysis data');
  }

  const headers = [
    'SKU',
    'Batch',
    'Total Measurements',
    'Pass Rate',
    'Top Coil Mean',
    'Top Coil StdDev',
    'Top Coil Min',
    'Top Coil Max',
    'Top Coil Cp',
    'Top Coil Cpk',
    'Bottom Coil Mean',
    'Bottom Coil StdDev',
    'Bottom Coil Min',
    'Bottom Coil Max',
    'Bottom Coil Cp',
    'Bottom Coil Cpk'
  ];

  const row = [
    sku,
    batchId || 'All Batches',
    analysis.totalMeasurements || 0,
    ((analysis.passRate || 0) * 100).toFixed(1) + '%',
    safeNumber(analysis.topCoilStats.mean),
    safeNumber(analysis.topCoilStats.stdDev),
    safeNumber(analysis.topCoilStats.min),
    safeNumber(analysis.topCoilStats.max),
    analysis.topCoilStats.cp ? analysis.topCoilStats.cp.toFixed(2) : 'N/A',
    analysis.topCoilStats.cpk ? analysis.topCoilStats.cpk.toFixed(2) : 'N/A',
    safeNumber(analysis.bottomCoilStats.mean),
    safeNumber(analysis.bottomCoilStats.stdDev),
    safeNumber(analysis.bottomCoilStats.min),
    safeNumber(analysis.bottomCoilStats.max),
    analysis.bottomCoilStats.cp ? analysis.bottomCoilStats.cp.toFixed(2) : 'N/A',
    analysis.bottomCoilStats.cpk ? analysis.bottomCoilStats.cpk.toFixed(2) : 'N/A'
  ];

  if (Array.isArray(analysis.topCoilStats.measurements)) {
    headers.push('Top Coil Raw Measurements');
    row.push(analysis.topCoilStats.measurements.map(m => safeNumber(m)).join('|'));
  }
  if (Array.isArray(analysis.bottomCoilStats.measurements)) {
    headers.push('Bottom Coil Raw Measurements');
    row.push(analysis.bottomCoilStats.measurements.map(m => safeNumber(m)).join('|'));
  }

  return [
    headers.join(','),
    row.map(escapeValue).join(',')
  ].join('\n');
};

// Export analysis results
export const exportAnalysis = (analysis: QCAnalysis, sku: string, batchId?: string): Blob => {
  try {
    if (!analysis || !sku) {
      throw new Error('Analysis data and SKU are required');
    }

    const csv = convertAnalysisToCSV(analysis, sku, batchId);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  } catch (error: any) {
    console.error('Error exporting analysis:', error);
    throw error;
  }
};

// Export full batch data as JSON
export const exportBatchData = async (batchId: string): Promise<Blob> => {
  try {
    const batchRef = doc(db, 'batches', batchId);
    const batchDoc = await getDoc(batchRef);
    if (!batchDoc.exists()) {
      throw new Error('Batch not found');
    }
    const batchData = batchDoc.data();

    const measurementsRef = collection(db, 'measurements');
    const q = query(measurementsRef, where('batchId', '==', batchId));
    const measurementsSnapshot = await getDocs(q);
    const measurements = measurementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));

    const organizedMeasurements = measurements.reduce((acc: any, measurement) => {
      const testType = measurement.testType || 'unknown';
      if (!acc[testType]) {
        acc[testType] = [];
      }
      acc[testType].push(measurement);
      return acc;
    }, {});

    const exportData = {
      batchInfo: {
        id: batchId,
        batchNumber: batchData.batchNumber,
        sku: batchData.sku,
        machineId: batchData.machineId,
        startedAt: batchData.startedAt?.toDate?.()?.toISOString() || null,
        completedAt: batchData.completedAt?.toDate?.()?.toISOString() || null
      },
      loadingSheet: batchData.loadingSheetData || null,
      measurements: organizedMeasurements,
      progress: {
        loadingSheetComplete: batchData.loadingSheetComplete || false,
        checklistComplete: batchData.checklistComplete || false,
        initialTestComplete: batchData.initialTestComplete || false,
        finalTestComplete: batchData.finalTestComplete || false,
        finalChecklistComplete: batchData.finalChecklistComplete || false
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  } catch (error: any) {
    console.error('Error exporting batch data:', error);
    throw error;
  }
};