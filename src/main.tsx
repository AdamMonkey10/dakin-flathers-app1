import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { MachineProvider } from './contexts/MachineContext';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MachineProvider>
          <App />
        </MachineProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);