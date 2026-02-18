import { GoogleGenAI, Type, Part } from "@google/genai";
import { Transaction } from '../types';

declare const pdfjsLib: any;

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-flash-latest';

const fileToGenerativePart = async (file: File): Promise<Part[]> => {
  if (file.type.startsWith('image/')) {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
    return [{
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    }];
  } else if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const parts: Part[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Could not get canvas context');
        }

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        
        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
            },
        });
    }
    return parts;
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
};


export const extractTransactions = async (file: File): Promise<Transaction[]> => {
  const imageParts = await fileToGenerativePart(file);

  const prompt = `You are an expert financial assistant specialized in extracting transaction data from bank statements.
Analyze the following bank statement pages. These pages may come from one or more documents. Extract all individual transactions. 
Ignore headers, footers, summaries, advertisements, and any non-transactional information.
For each transaction, provide the date, a clean description, and the amount.
- Format all dates as YYYY-MM-DD. If the year is not present, infer it from the statement date if available, otherwise assume the current year.
- Represent withdrawals, debits, and expenses as negative numbers.
- Represent deposits, credits, and payments to the account as positive numbers.
- Assign a relevant category to each transaction (e.g., Groceries, Dining, Transport, Salary, Bills, Shopping, Entertainment, Rent, Other).
- Provide the output ONLY as a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting.
Each object in the array should have the keys: "date", "description", "amount", and "category".
`;
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        date: {
          type: Type.STRING,
          description: "Transaction date in YYYY-MM-DD format.",
        },
        description: {
          type: Type.STRING,
          description: "A clean, concise description of the transaction.",
        },
        amount: {
          type: Type.NUMBER,
          description: "Transaction amount. Negative for debits/expenses, positive for credits/deposits.",
        },
        category: {
          type: Type.STRING,
          description: "A relevant category like 'Groceries', 'Salary', 'Bills', etc.",
        },
      },
      required: ["date", "description", "amount", "category"],
    },
  };
  
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: prompt }, ...imageParts] },
    config: {
        responseMimeType: "application/json",
        responseSchema: schema,
    },
  });
  
  const jsonText = response.text.trim();
  
  try {
    const parsedJson = JSON.parse(jsonText);
    if (!Array.isArray(parsedJson)) {
        throw new Error("Expected a JSON array but received a different type.");
    }
    return parsedJson as Transaction[];
  } catch(e) {
      console.error("Failed to parse JSON response:", jsonText);
      throw new Error("The model returned an invalid data format. Please check the document and try again.");
  }
};


export const generateFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
    const prompt = `You are a helpful financial analyst. Based on the following JSON transaction data, provide a concise and practical financial insights summary.
The summary should be written in a human-readable format. Use markdown for structure.

The analysis must include:
1.  **Financial Summary:** A short, 1-2 sentence overview of the financial activity (e.g., "This month saw a healthy income, though spending on dining was significant.").
2.  **Top 3 Spending Categories:** Identify and list the top three spending categories by total amount.
3.  **Unusual or Large Transactions:** Point out 1-2 transactions that are unusually large compared to the others or are from a noteworthy category (e.g., a large one-time purchase, a significant cash withdrawal).
4.  **Potential Recurring Payments:** Detect and list 2-3 potential recurring payments or subscriptions (e.g., Netflix, Spotify, Gym Membership).
5.  **Smart Saving Suggestions:** Provide 2-3 actionable saving suggestions based directly on the spending patterns observed in the data.

Here is the transaction data:
${JSON.stringify(transactions, null, 2)}

Please format your entire response using Markdown, starting each section with a heading (e.g., '### Financial Summary').
`;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });

    return response.text.trim();
};