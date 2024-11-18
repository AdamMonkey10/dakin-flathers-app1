import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MachineProvider } from './contexts/MachineContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import LoadingSheet from './pages/LoadingSheet';
import PreflightChecklist from './pages/PreflightChecklist';
import InitialTest from './pages/InitialTest';
import RegularTest from './pages/RegularTest';
import FinalTest from './pages/FinalTest';
import FinalChecklist from './pages/FinalChecklist';
import PreLoadBatch from './pages/PreLoadBatch';
import PreloadedBatches from './pages/PreloadedBatches';
import BarcodeProduction from './pages/BarcodeProduction';
import CompletedBatches from './pages/CompletedBatches';
import BatchReport from './pages/BatchReport';
import PerformanceMetrics from './pages/PerformanceMetrics';
import AddProduct from './pages/AddProduct';
import Operators from './pages/Operators';

export default function App() {
  return (
    <AuthProvider>
      <MachineProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
          <Route path="/preload" element={<PrivateRoute><PreLoadBatch /></PrivateRoute>} />
          <Route path="/preloaded-batches" element={<PrivateRoute><PreloadedBatches /></PrivateRoute>} />
          <Route path="/completed-batches" element={<PrivateRoute><CompletedBatches /></PrivateRoute>} />
          <Route path="/batch/:id/report" element={<PrivateRoute><BatchReport /></PrivateRoute>} />
          <Route path="/performance-metrics" element={<PrivateRoute><PerformanceMetrics /></PrivateRoute>} />
          <Route path="/operators" element={<PrivateRoute><Operators /></PrivateRoute>} />
          
          {/* Machine-specific routes */}
          <Route path="/machine/:id">
            <Route path="loading-sheet" element={<PrivateRoute><LoadingSheet /></PrivateRoute>} />
            <Route path="barcode-production" element={<PrivateRoute><BarcodeProduction /></PrivateRoute>} />
            <Route path="checklist" element={<PrivateRoute><PreflightChecklist /></PrivateRoute>} />
            <Route path="initial-test" element={<PrivateRoute><InitialTest /></PrivateRoute>} />
            <Route path="test" element={<PrivateRoute><RegularTest /></PrivateRoute>} />
            <Route path="final-test" element={<PrivateRoute><FinalTest /></PrivateRoute>} />
            <Route path="final-checklist" element={<PrivateRoute><FinalChecklist /></PrivateRoute>} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </MachineProvider>
    </AuthProvider>
  );
}