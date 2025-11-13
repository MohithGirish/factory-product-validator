export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'staff';
}

export interface ProductData {
  id: string; // Add ID for easier state management
  batchNumberFormat: string;
  barcode: string;
  productName: string;
  productionDate: string;
}

export interface ValidationRecord {
  id: string;
  userId: string;
  imageUrl?: string; // Optional for manual entries
  extractedBatch: string;
  extractedBarcode: string;
  isValid: boolean;
  timestamp: string;
  productName?: string;
  validationMethod: 'ocr' | 'manual';
  extractedProductionDate?: string;
  extractedExpiryDate?: string;
  extractedPrice?: string;
}

export enum ValidationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum Page {
    VALIDATOR = 'validator',
    DATABASE = 'database',
    HISTORY = 'history',
    ADMIN = 'admin'
}