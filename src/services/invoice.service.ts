import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, Type, SchemaType } from "@google/genai";

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: string;
  customer_name: string;
  invoice_date: string;
  invoice_number: string;
  items: InvoiceItem[];
  totalAmount: number; // Calculated helper
  status: 'verified' | 'draft';
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  // --- State ---
  private invoicesSignal = signal<Invoice[]>([]);
  
  // Public read-only signals
  readonly invoices = this.invoicesSignal.asReadonly();
  
  // Computed Analytics
  readonly inventoryNeeds = computed(() => {
    const needs: Record<string, number> = {};
    this.invoicesSignal().forEach(inv => {
      inv.items.forEach(item => {
        const key = item.name.toLowerCase().trim();
        needs[key] = (needs[key] || 0) + item.quantity;
      });
    });
    // Convert to array for easier display
    return Object.entries(needs)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  });

  readonly accountsReceivable = computed(() => {
    const receivables: Record<string, number> = {};
    this.invoicesSignal().forEach(inv => {
      const key = inv.customer_name.trim();
      receivables[key] = (receivables[key] || 0) + inv.totalAmount;
    });
    return Object.entries(receivables)
      .map(([customer, amount]) => ({ customer, amount }))
      .sort((a, b) => b.amount - a.amount);
  });

  readonly totalRevenue = computed(() => {
    return this.invoicesSignal().reduce((acc, curr) => acc + curr.totalAmount, 0);
  });

  constructor() {
    // Load some mock data for demo purposes if empty
    if (this.invoicesSignal().length === 0) {
      this.invoicesSignal.set([
        {
          id: '1',
          customer_name: 'Bistro 42',
          invoice_date: '2023-10-15',
          invoice_number: 'INV-001',
          items: [
            { name: 'Eco Forks (Box)', quantity: 10, unit_price: 25.00, total_price: 250.00 },
            { name: 'Napkins (Pack)', quantity: 50, unit_price: 5.00, total_price: 250.00 }
          ],
          totalAmount: 500.00,
          status: 'verified'
        },
        {
          id: '2',
          customer_name: 'Café Delight',
          invoice_date: '2023-10-18',
          invoice_number: 'INV-002',
          items: [
            { name: 'Eco Spoons (Box)', quantity: 5, unit_price: 25.00, total_price: 125.00 }
          ],
          totalAmount: 125.00,
          status: 'verified'
        }
      ]);
    }
  }

  // --- Actions ---

  async analyzeInvoiceImage(base64Image: string): Promise<Partial<Invoice>> {
    const apiKey = process.env['API_KEY'];
    if (!apiKey) {
      throw new Error('API Key is missing');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Define strict schema for extracting data
    const schema = {
      type: Type.OBJECT,
      properties: {
        customer_name: { type: Type.STRING },
        invoice_date: { type: Type.STRING, description: "YYYY-MM-DD format" },
        invoice_number: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit_price: { type: Type.NUMBER },
              total_price: { type: Type.NUMBER }
            }
          }
        }
      },
      required: ["customer_name", "items"],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg', // Assuming JPEG for simplicity, works with PNG too usually
                data: base64Image
              }
            },
            {
              text: "Extract the invoice details from this image. Return strictly JSON data matching the schema."
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1 // Low temperature for factual extraction
        }
      });

      const text = response.text;
      if (!text) throw new Error("No data extracted");
      
      const parsed = JSON.parse(text);
      return parsed;

    } catch (error) {
      console.error("Gemini Extraction Error:", error);
      throw error;
    }
  }

  addInvoice(invoiceData: Partial<Invoice>) {
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      customer_name: invoiceData.customer_name || 'Unknown Customer',
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      invoice_number: invoiceData.invoice_number || 'UNKNOWN',
      items: invoiceData.items || [],
      totalAmount: (invoiceData.items || []).reduce((sum, item) => sum + (item.total_price || 0), 0),
      status: 'verified'
    };

    this.invoicesSignal.update(current => [newInvoice, ...current]);
  }
}