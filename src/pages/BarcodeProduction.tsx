import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import Barcode from 'react-barcode';

interface BarcodeData {
  batchNumber: string;
  coilNumber: string;
}

export default function BarcodeProduction() {
  const location = useLocation();
  const navigate = useNavigate();
  const [barcodes, setBarcodes] = useState<BarcodeData[]>([]);

  useEffect(() => {
    if (location.state?.barcodes) {
      setBarcodes(location.state.barcodes);
    }
  }, [location.state]);

  const handlePrint = () => {
    window.print();
    
    // After printing, navigate to the next step with all required information
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, {
        state: { 
          batchNumber: location.state.batchNumber,
          batchId: location.state.batchId,
          machineId: location.state.machineId
        }
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 no-print">
          <Link 
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Machines
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Barcodes & Continue
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 print:grid-cols-3">
          {barcodes.map((barcode, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="font-bold mb-4">
                Batch: {barcode.batchNumber}<br />
                Coil: {barcode.coilNumber}
              </p>
              <div className="flex justify-center">
                <Barcode 
                  value={`${barcode.batchNumber}-${barcode.coilNumber}`}
                  width={1.5}
                  height={50}
                  fontSize={12}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}