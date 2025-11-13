
import React from 'react';
import { ValidationRecord } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { XIcon } from './icons/XIcon';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Omit<ValidationRecord, 'id' | 'timestamp' | 'userId'> | null;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <XIcon className="h-6 w-6" />
          </button>

          <div className="text-center">
            {result.isValid ? (
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            ) : (
              <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
            )}
            <h2 className={`mt-4 text-2xl font-bold ${result.isValid ? 'text-green-800' : 'text-red-800'}`}>
              {result.isValid ? 'Validation Successful' : 'Validation Failed'}
            </h2>
            <p className="mt-2 text-gray-500">
              {result.isValid ? 'The product details match the master database.' : 'The product details could not be validated.'}
            </p>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Validation Details</h3>
            <div className="space-y-3 text-sm">
                {result.productName && (
                     <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-500">Product Name:</span>
                        <span className="font-semibold text-gray-800 text-right">{result.productName}</span>
                    </div>
                )}
                 <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">Batch Number:</span>
                    <span className="font-mono bg-slate-100 text-slate-900 px-2 py-1 rounded border border-slate-200">{result.extractedBatch || 'N/A'}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">Barcode:</span>
                    <span className="font-mono bg-slate-100 text-slate-900 px-2 py-1 rounded border border-slate-200">{result.extractedBarcode || 'N/A'}</span>
                </div>
                {result.extractedProductionDate && (
                     <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-500">Prod. Date:</span>
                        <span className="font-mono bg-slate-100 text-slate-900 px-2 py-1 rounded border border-slate-200">{result.extractedProductionDate}</span>
                    </div>
                )}
                {result.extractedExpiryDate && (
                     <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-500">Expiry Date:</span>
                        <span className="font-mono bg-slate-100 text-slate-900 px-2 py-1 rounded border border-slate-200">{result.extractedExpiryDate}</span>
                    </div>
                )}
                {result.extractedPrice && (
                     <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-500">Price (MRP):</span>
                        <span className="font-mono bg-slate-100 text-slate-900 px-2 py-1 rounded border border-slate-200">{result.extractedPrice}</span>
                    </div>
                )}
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
