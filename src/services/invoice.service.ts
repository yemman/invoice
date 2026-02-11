import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, InvoiceItem } from '../models/invoice.model';
import { CatalogService } from './catalog.service';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly COLLECTION_NAME = 'invoices';

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

  constructor(private firebaseService: FirebaseService, private catalogService: CatalogService, private messageService: MessageService) {
    this.subscribeToInvoices();
  }

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    try {
      await this.firebaseService.updateInvoice(id, updates);
    } catch (error) {
      console.error("Failed to update invoice:", error);
      throw error;
    }
  }

  async deleteInvoice(id: string) {
    try {
      await this.firebaseService.deleteInvoice(id);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      throw error;
    }
  }

  private subscribeToInvoices() {
    this.firebaseService.subscribeToInvoices(
      (invoices) => this.invoicesSignal.set(invoices),
      (error) => {
        console.error("Failed to load invoices:", error);
        this.invoicesSignal.set(this.getFallbackData());
      }
    );
  }

  async analyzeInvoiceImage(base64Image: string): Promise<Partial<Invoice>> {
    let apiKey = '';

    if(!environment.production){
      apiKey = environment.apiKey;
    }
    else{
      apiKey = typeof process !== 'undefined' ? process.env['API_KEY'] : '';
    }

    if (!apiKey) {   
      throw new Error('API Key is missing');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Updated schema based on specific OCR requirements (Index/Quantity)
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          quantity: { type: Type.INTEGER }
        },
        required: ["index", "quantity"]
      }
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            },
            {
              text: "You are an OCR expert. Analyze the provided image of a flatware invoice. Look at the far-right column for the index number (1-999). Look at the far-left column for handwritten quantities. These are the items the customer wants. Extract only the rows where there is a handwritten value in the far-left column. Return a JSON array of objects with these keys: index and quantity. Ensure that a handwritten '4' next to index '13' is correctly mapped as { 'index': 13, 'quantity': 4 }."
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1
        }
      });

      const text = response.text;
      if (!text) throw new Error("No data extracted");
      
      // The response is strictly [{index, quantity}].
      const rawData = JSON.parse(text); 
      
      // Map back to application domain model (InvoiceItem)
      const items: InvoiceItem[] = rawData.map((item: any) => {
        const catalog = this.catalogService.getCatalogItemByIndex(item.index);
        const unitPrice = catalog ? catalog.unit_price : 0;
        const name = catalog ? catalog.name : `Catalog Item #${item.index}`;
        return {
          name: name,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * item.quantity,
          catalogId: catalog?.id,
          catalogIndex: item.index
        } as InvoiceItem;
      });

      // Return a Partial<Invoice> that the UI expects
      return {
        customer_name: "Unknown Customer",
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_number: "PENDING",
        items: items
      };

    } catch (error) {
      console.error("Gemini Extraction Error:", error);
      throw error;
    }
  }

  async addInvoice(invoiceData: Partial<Invoice>) {
    try {
      await this.firebaseService.addInvoice(invoiceData);
      this.messageService.success('Invoice saved');
    } catch (error) {
      this.messageService.error("Failed to save to database. Check console for details.");
      throw error;
    }
  }

  private getFallbackData(): Invoice[] {
    return [
      {
        id: '1',
        customer_name: 'Bistro 42 (Demo)',
        invoice_date: '2023-10-15',
        invoice_number: 'INV-001',
        items: [
          { name: 'Eco Forks (Box)', quantity: 10, unit_price: 25.00, total_price: 250.00 },
          { name: 'Napkins (Pack)', quantity: 50, unit_price: 5.00, total_price: 250.00 }
        ],
        totalAmount: 500.00,
        status: 'verified'
      }
    ];
  }
}