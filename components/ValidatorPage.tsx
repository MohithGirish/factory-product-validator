import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { extractBarcodeFromImage, extractBatchCodeFromImage } from '../services/geminiService';
import { ValidationStatus, ValidationRecord, ProductData } from '../types';
import { databaseService } from '../services/databaseService';
import ResultModal from './ResultModal';
import Spinner from './common/Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import CameraModal from './CameraModal';
import { CameraIcon } from './icons/CameraIcon';

const validateBatchCodeAgainstFormat = (batchCode: string, format: string): boolean => {
    if (!batchCode || !format) return false;

    let regex = '^';
    let i = 0;
    while (i < format.length) {
        let twoCharToken = format.substring(i, i + 2);
        if (twoCharToken === 'HH') {
            regex += '(?:0[0-9]|1[0-9]|2[0-3])';
            i += 2;
            continue;
        }
        if (twoCharToken === 'MM') {
            regex += '[0-5][0-9]';
            i += 2;
            continue;
        }
        
        let oneCharToken = format.charAt(i);
        switch(oneCharToken) {
            case 'N':
                regex += '\\d';
                break;
            case 'S':
                regex += '[A-C]';
                break;
            case ' ':
                regex += '\\s*';
                break;
            case ':':
                regex += ':';
                break;
            default:
                regex += oneCharToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        i++;
    }
    regex += '$';

    const finalRegex = new RegExp(regex, 'i');
    return finalRegex.test(batchCode.trim());
};

const ValidatorPage: React.FC = () => {
  const { addHistoryRecord } = useAuth();
  const [step, setStep] = useState<'barcode' | 'batch'>('barcode');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [status, setStatus] = useState<ValidationStatus>(ValidationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const [foundProduct, setFoundProduct] = useState<ProductData | null>(null);
  const [extractedBarcode, setExtractedBarcode] = useState<string>('');
  
  const [resultForModal, setResultForModal] = useState<Omit<ValidationRecord, 'id' | 'timestamp' | 'userId'> | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImageInput = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const resetState = useCallback(() => {
    setStep('barcode');
    setStatus(ValidationStatus.IDLE);
    setFoundProduct(null);
    setExtractedBarcode('');
    setResultForModal(null);
    resetImageInput();
  }, [resetImageInput]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('File size must be less than 4MB.');
        return;
      }
      setError(null);
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };
  
  const handleCapture = (file: File) => {
    if (file) {
        setError(null);
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setIsCameraOpen(false);
    }
  };

  const handleBarcodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile) {
      setError('Please select or capture an image of the barcode.');
      return;
    }
    
    setStatus(ValidationStatus.LOADING);
    setError(null);

    try {
      const barcode = await extractBarcodeFromImage(imageFile);
      if (!barcode) {
        throw new Error('Could not read barcode from the image.');
      }
      
      const product = await databaseService.findProductByBarcode(barcode);
      if (!product) {
        throw new Error(`Product with barcode "${barcode}" not found in the database.`);
      }

      setFoundProduct(product);
      setExtractedBarcode(barcode);
      setStep('batch');
      setStatus(ValidationStatus.IDLE);
      resetImageInput();
      
    } catch (err: any) {
      console.error('Error during barcode validation:', err);
      setError(err.message || 'Failed to validate barcode. Please try again.');
      setStatus(ValidationStatus.ERROR);
    }
  };

  const handleBatchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile || !foundProduct) {
      setError('Please select or capture an image of the batch code.');
      return;
    }

    setStatus(ValidationStatus.LOADING);
    setError(null);

    try {
        const batchCode = await extractBatchCodeFromImage(imageFile);
        if(!batchCode) {
            throw new Error('Could not read batch code from the image.');
        }

        const isValid = validateBatchCodeAgainstFormat(batchCode, foundProduct.batchNumberFormat);

        const validationResult: Omit<ValidationRecord, 'id' | 'timestamp' | 'userId'> = {
            extractedBatch: batchCode,
            extractedBarcode: extractedBarcode,
            isValid: isValid,
            productName: foundProduct?.productName,
            validationMethod: 'ocr',
            imageUrl: imageUrl!,
            extractedProductionDate: undefined,
            extractedExpiryDate: undefined,
            extractedPrice: undefined,
        };
        
        setResultForModal(validationResult);
        addHistoryRecord(validationResult);
        setStatus(ValidationStatus.SUCCESS);
        setIsModalOpen(true);

    } catch (err: any) {
        console.error('Error during batch code validation:', err);
        setError(err.message || 'Failed to validate batch code. Please try again.');
        setStatus(ValidationStatus.ERROR);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    resetState();
  };

  const imageUploader = (
    <>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
        Product Package Image
      </label>
      <div 
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-md object-contain" />
          ) : (
            <>
              <UploadIcon />
              <div className="flex text-sm text-gray-600">
                <p className="pl-1">Upload a file or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
            </>
          )}
        </div>
      </div>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/png, image/jpeg, image/gif"
      />
       {imageFile && (
          <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700 truncate">{imageFile.name}</p>
              <button type="button" onClick={resetImageInput} className="ml-4 text-red-500 hover:text-red-700">
                  <XCircleIcon className="w-5 h-5"/>
              </button>
          </div>
       )}
    </>
  );

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {step === 'barcode' ? (
             <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-1">Step 1: Scan Barcode</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Upload an image to identify the product.</p>
              <form onSubmit={handleBarcodeSubmit}>
                  {imageUploader}
                  <div className="mt-4 flex items-center">
                      <span className="flex-grow border-t border-gray-300"></span>
                      <span className="mx-4 text-gray-500 text-sm font-semibold">OR</span>
                      <span className="flex-grow border-t border-gray-300"></span>
                  </div>
                  <button type="button" onClick={() => setIsCameraOpen(true)} className="w-full mt-4 flex justify-center items-center bg-gray-600 text-white p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                      <CameraIcon className="w-5 h-5 mr-2" />
                      Use Camera
                  </button>
                  {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                  <div className="mt-8">
                    <button type="submit" disabled={status === ValidationStatus.LOADING || !imageFile} className="w-full flex justify-center items-center bg-blue-600 text-white p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                      {status === ValidationStatus.LOADING ? <Spinner /> : 'Find Product by Barcode'}
                    </button>
                  </div>
              </form>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-1">Step 2: Validate Batch Code</h2>
              <p className="text-sm text-gray-500 text-center mb-2">
                Product: <span className="font-semibold text-gray-700">{foundProduct?.productName}</span>
              </p>
              <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                <p className="text-sm font-semibold text-blue-800">Expected Format: <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded">{foundProduct?.batchNumberFormat}</span></p>
              </div>
              <form onSubmit={handleBatchSubmit}>
                  {imageUploader}
                  <div className="mt-4 flex items-center">
                      <span className="flex-grow border-t border-gray-300"></span>
                      <span className="mx-4 text-gray-500 text-sm font-semibold">OR</span>
                      <span className="flex-grow border-t border-gray-300"></span>
                  </div>
                   <button type="button" onClick={() => setIsCameraOpen(true)} className="w-full mt-4 flex justify-center items-center bg-gray-600 text-white p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                      <CameraIcon className="w-5 h-5 mr-2" />
                      Use Camera
                  </button>
                  {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <button type="button" onClick={resetState} className="w-full flex justify-center items-center bg-gray-200 text-gray-800 p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-gray-300">
                      Start Over
                    </button>
                    <button type="submit" disabled={status === ValidationStatus.LOADING || !imageFile} className="w-full flex justify-center items-center bg-blue-600 text-white p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                      {status === ValidationStatus.LOADING ? <Spinner /> : 'Validate Batch Code'}
                    </button>
                  </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <CameraModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
      <ResultModal isOpen={isModalOpen} onClose={closeModal} result={resultForModal} />
    </>
  );
};

export default ValidatorPage;