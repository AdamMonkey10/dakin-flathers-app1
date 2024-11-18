// Update CompletedBatch type to include machineId
export interface CompletedBatch {
  id: string;
  batchNumber: string;
  sku: string;
  machineId: string;
  isActive: boolean;
  completedAt: string;
  loadingSheetComplete?: boolean;
  checklistComplete?: boolean;
  initialTestComplete?: boolean;
  finalTestComplete?: boolean;
  finalChecklistComplete?: boolean;
}