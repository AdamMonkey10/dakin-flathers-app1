<diff>@@ -6,1 +6,1 @@
-import { createNewBatch, getPreloadedBatches } from '../lib/db';
+import { createNewBatch, getPreloadedBatches, transferPreloadedBatch } from '../lib/db';
@@ -89,0 +90,17 @@
+  const handleTransferBatch = async (batch: any, newMachineId: string) => {
+    setLoading(true);
+    try {
+      await transferPreloadedBatch(batch.id, newMachineId);
+      // Reload preloaded batches
+      const updatedBatches = await getPreloadedBatches(currentMachine);
+      setPreloadedBatches(updatedBatches);
+    } catch (err) {
+      console.error('Error transferring batch:', err);
+      setError('Failed to transfer batch');
+    } finally {
+      setLoading(false);
+      setShowPreloadedModal(false);
+    }
+  };
+
@@ -194,0 +212,1 @@
+          onTransferBatch={handleTransferBatch}
</diff>