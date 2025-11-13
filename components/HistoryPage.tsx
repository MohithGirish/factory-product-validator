
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ValidationRecord } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { KeyboardIcon } from './icons/KeyboardIcon';
import { databaseService } from '../services/databaseService';

const HistoryCard: React.FC<{ record: ValidationRecord; username?: string }> = ({ record, username }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col md:flex-row">
      <div className="md:w-1/3 flex-shrink-0 bg-gray-50 flex items-center justify-center">
        {record.validationMethod === 'ocr' && record.imageUrl ? (
          <img src={record.imageUrl} alt="Validated product" className="object-cover h-48 w-full md:h-full" />
        ) : (
          <div className="p-4 text-center">
             <KeyboardIcon className="h-16 w-16 text-gray-300 mx-auto" />
             <p className="mt-2 text-xs text-gray-500 font-semibold uppercase">Manual Entry</p>
          </div>
        )}
      </div>
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${record.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {record.isValid ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <XCircleIcon className="w-4 h-4 mr-2" />}
            {record.isValid ? 'Valid' : 'Invalid'}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</p>
            {username && <p className="text-xs text-gray-700 font-semibold mt-1 text-right">by {username}</p>}
          </div>
        </div>
        {record.productName && <h3 className="mt-3 text-lg font-bold text-gray-800">{record.productName}</h3>}
        <div className="mt-3 text-sm space-y-2 text-gray-600">
            <p><strong>Batch No.:</strong> <span className="font-mono bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200">{record.extractedBatch || 'N/A'}</span></p>
            <p><strong>Barcode:</strong> <span className="font-mono bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200">{record.extractedBarcode || 'N/A'}</span></p>
            {record.extractedProductionDate && <p><strong>Prod. Date:</strong> <span className="font-mono bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200">{record.extractedProductionDate}</span></p>}
            {record.extractedExpiryDate && <p><strong>Expiry Date:</strong> <span className="font-mono bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200">{record.extractedExpiryDate}</span></p>}
            {record.extractedPrice && <p><strong>Price:</strong> <span className="font-mono bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200">{record.extractedPrice}</span></p>}
        </div>
      </div>
    </div>
  );
};

const HistoryPage: React.FC = () => {
  const { history, user } = useAuth();
  const [users, setUsers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchUsers = async () => {
        if (user?.role === 'admin') {
            try {
              const usersData = await databaseService.getUsers();
              const userMap = new Map(usersData.map(u => [u.id, u.username]));
              setUsers(userMap);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        }
    };
    fetchUsers();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">
            {user?.role === 'admin' ? 'Global Validation History' : 'My Validation History'}
        </h1>
        <p className="mt-2 text-gray-500">
            {user?.role === 'admin' ? 'A log of all validation attempts across all users.' : 'A log of your past validation attempts.'}
        </p>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center mt-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No history</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by validating a product image.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          {history.map(record => (
            <HistoryCard 
                key={record.id} 
                record={record}
                username={user?.role === 'admin' ? (users.get(record.userId) || 'Unknown') : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;