import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getQCAnalysisBySKU } from '../lib/qcService';
import { exportMeasurements } from '../lib/api';

interface MachineCardProps {
  id: string;
  name: string;
  isActive: boolean;
  currentBatch: string;
  lastUpdated: any;
  progress?: {
    loadingSheet: boolean;
    preflightChecklist: boolean;
    initialTest: boolean;
    finalTest: boolean;
    finalChecklist: boolean;
  };
  onClick: () => void;
  sku?: string;
}

interface InitialTestMetrics {
  topAvg: number | null;
  bottomAvg: number | null;
  cp: number | null;
  cpk: number | null;
}

export default function MachineCard({
  id,
  name,
  isActive,
  currentBatch,
  lastUpdated,
  progress,
  onClick,
  sku
}: MachineCardProps) {
  const [metrics, setMetrics] = useState<{
    cp?: number;
    cpk?: number;
    measurements: number;
  }>({ measurements: 0 });
  const [initialMetrics, setInitialMetrics] = useState<InitialTestMetrics>({
    topAvg: null,
    bottomAvg: null,
    cp: null,
    cpk: null
  });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!isActive || !currentBatch || !sku) return;
      
      try {
        const analysis = await getQCAnalysisBySKU(sku, currentBatch);
        setMetrics({
          cp: analysis.topCoilStats.cp,
          cpk: analysis.topCoilStats.cpk,
          measurements: analysis.totalMeasurements
        });

        // Load initial test metrics
        const measurementsRef = collection(db, 'measurements');
        const q = query(
          measurementsRef, 
          where('batchId', '==', currentBatch),
          where('testType', '==', 'initial')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const initialTest = snapshot.docs[0].data();
          const topCoilData = initialTest.topCoilData || [];
          const bottomCoilData = initialTest.bottomCoilData || [];

          // Calculate averages
          const topValues = topCoilData.map((d: any) => parseFloat(d.height)).filter((h: number) => !isNaN(h));
          const bottomValues = bottomCoilData.map((d: any) => parseFloat(d.height)).filter((h: number) => !isNaN(h));

          const topAvg = topValues.length > 0 ? topValues.reduce((a: number, b: number) => a + b, 0) / topValues.length : null;
          const bottomAvg = bottomValues.length > 0 ? bottomValues.reduce((a: number, b: number) => a + b, 0) / bottomValues.length : null;

          setInitialMetrics({
            topAvg,
            bottomAvg,
            cp: analysis.topCoilStats.cp || null,
            cpk: analysis.topCoilStats.cpk || null
          });
        }
      } catch (error) {
        console.error('Error loading QC analysis:', error);
      }
    };

    loadMetrics();
  }, [isActive, currentBatch, sku]);

  const handleExportCSV = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentBatch) {
      setExportError('No batch selected for export');
      return;
    }

    setExporting(true);
    setExportError(null);

    try {
      const data = await exportMeasurements(currentBatch);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${currentBatch}-measurements.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting measurements:', error);
      setExportError(error.message || 'Failed to export measurements');
    } finally {
      setExporting(false);
      if (exportError) {
        setTimeout(() => setExportError(null), 3000);
      }
    }
  };

  const getTimeSinceLastUpdate = () => {
    if (!lastUpdated) return 'N/A';
    
    const now = new Date();
    const date = lastUpdated.toDate();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getStatusStyles = () => {
    if (isActive) {
      return {
        card: 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white',
        badge: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className="h-4 w-4 text-green-600 mr-1.5" />
      };
    }
    return {
      card: 'border-l-4 border-l-gray-300 bg-white',
      badge: 'bg-gray-100 text-gray-800',
      icon: <AlertCircle className="h-4 w-4 text-gray-600 mr-1.5" />
    };
  };

  const getProgressSteps = () => {
    if (!progress) return [];
    
    return [
      { key: 'loadingSheet', label: 'Loading Sheet', completed: progress.loadingSheet },
      { key: 'preflightChecklist', label: 'Pre-flight Checklist', completed: progress.preflightChecklist },
      { key: 'initialTest', label: 'Initial Test', completed: progress.initialTest },
      { key: 'finalTest', label: 'Quality Control', completed: progress.finalTest },
      { key: 'finalChecklist', label: 'Final Checklist', completed: progress.finalChecklist }
    ];
  };

  const getProgressPercentage = () => {
    const steps = getProgressSteps();
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  const getNextStep = () => {
    const nextStep = getProgressSteps().find(step => !step.completed);
    return nextStep?.label || 'Complete';
  };

  const cardStyles = getStatusStyles();

  return (
    <div 
      onClick={onClick}
      className={`w-full rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${cardStyles.card}`}
    >
      <div className="p-4 bg-gray-50 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${cardStyles.badge}`}>
              {cardStyles.icon}
              {isActive ? 'Active' : 'Idle'}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {getTimeSinceLastUpdate()}
          </div>
        </div>
      </div>

      <div className="p-4">
        {currentBatch ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Batch</p>
                <p className="text-lg font-bold text-gray-900">{currentBatch}</p>
              </div>
              {metrics.measurements > 0 && (
                <div className="relative">
                  <button
                    onClick={handleExportCSV}
                    disabled={exporting}
                    className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Download className={`h-4 w-4 mr-1 ${exporting ? 'animate-bounce' : ''}`} />
                    {exporting ? 'Exporting...' : 'Export'}
                  </button>
                  {exportError && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {exportError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Initial Test Metrics - Displayed right after batch info */}
            {progress?.initialTest && initialMetrics.topAvg !== null && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Initial Test Guide</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-blue-700">Top:</span>
                      <span className="ml-2 font-medium">{initialMetrics.topAvg.toFixed(4)}"</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-blue-700">Bottom:</span>
                      <span className="ml-2 font-medium">{initialMetrics.bottomAvg?.toFixed(4) || 'N/A'}"</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-blue-700">Cp:</span>
                      <span className="ml-2 font-medium">{initialMetrics.cp?.toFixed(2) || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-blue-700">Cpk:</span>
                      <span className="ml-2 font-medium">{initialMetrics.cpk?.toFixed(2) || 'N/A'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-500">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {getProgressSteps().map((step) => (
                  <div key={step.key} className="flex items-center justify-between text-sm">
                    <span className={step.completed ? 'text-gray-500' : 'text-gray-900'}>
                      {step.label}
                    </span>
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-blue-600">
                  Next: {getNextStep()}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Click to start new batch</p>
        )}
      </div>
    </div>
  );
}