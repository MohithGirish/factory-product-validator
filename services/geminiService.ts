import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve(''); 
      }
    };
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: { data, mimeType: file.type },
  };
};

export const extractBarcodeFromImage = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "From the product package image, extract only the barcode number. The barcode may be oriented vertically or horizontally. Provide the response in JSON format. If a value cannot be found, return an empty string for that key." },
                imagePart
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    barcode: {
                        type: Type.STRING,
                        description: "The numerical barcode value found on the product packaging."
                    },
                },
                required: ["barcode"]
            }
        }
    });
    
    const jsonStr = response.text.trim();
    try {
      const result = JSON.parse(jsonStr);
      return result.barcode || '';
    } catch(e) {
      console.error("Error parsing Gemini response for barcode:", e);
      return '';
    }
};

export const extractBatchCodeFromImage = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "From the product package image, extract only the text corresponding to 'Batch No.'. Provide the response in JSON format. If a value cannot be found, return an empty string for that key." },
                imagePart
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    batchNumber: {
                        type: Type.STRING,
                        description: "The batch number found on the product packaging."
                    },
                },
                required: ["batchNumber"]
            }
        }
    });
    
    const jsonStr = response.text.trim();
    try {
      const result = JSON.parse(jsonStr);
      return result.batchNumber || '';
    } catch(e) {
      console.error("Error parsing Gemini response for batch number:", e);
      return '';
    }
};