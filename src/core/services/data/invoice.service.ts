import { Injectable, signal, computed, inject } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, InvoiceItem } from '../../models/invoice.model';
import { CatalogService } from './catalog.service';
import { MessageService } from '../common/message.service';
import { environment } from '../../../../environments/environment';
import { FirebaseService } from '../api/firebase.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { AppConstantsService } from '../constants/app-constants.service';
import { CalculationUtilityService } from '../common/calculation-utility.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private errorHandler = inject(ErrorHandlerService);
  private constants = inject(AppConstantsService);
  private calculation = inject(CalculationUtilityService);

  // --- State ---
  private invoicesSignal = signal<Invoice[]>([]);
  
  // Public read-only signals
  readonly invoices = this.invoicesSignal.asReadonly();
  
  // Computed Analytics
  readonly inventoryNeeds = computed(() => {
    const needs: Record<string, number> = {};
    this.invoicesSignal().forEach(inv => {
      inv.items.forEach(item => {
        const key = this.calculation.normalize(item.name);
        needs[key] = (needs[key] || 0) + item.quantity;
      });
    });
    return this.calculation.groupedToSortedArray(needs, 'name', 'total');
  });

  readonly accountsReceivable = computed(() => {
    const receivables: Record<string, number> = {};
    this.invoicesSignal().forEach(inv => {
      const key = this.calculation.normalize(inv.customer_name);
      receivables[key] = (receivables[key] || 0) + inv.totalAmount;
    });
    return this.calculation.groupedToSortedArray(receivables, 'customer', 'amount');
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
      this.errorHandler.handleError('updateInvoice', error);
      throw error;
    }
  }

  async deleteInvoice(id: string) {
    try {
      await this.firebaseService.deleteInvoice(id);
    } catch (error) {
      this.errorHandler.handleError('deleteInvoice', error);
      throw error;
    }
  }

  private subscribeToInvoices() {
    this.firebaseService.subscribeToInvoices(
      (invoices) => this.invoicesSignal.set(invoices),
      (error) => {
        this.errorHandler.handleError('subscribeToInvoices', error, 'Failed to load invoices');
        this.invoicesSignal.set(this.getFallbackData());
      }
    );
  }

 async analyzeInvoiceImage(base64Image: string): Promise<Partial<Invoice>> {
  try {
    // 1. Get raw data from the appropriate source
    const rawExtraction = environment.production 
      ? await this.callProxy(base64Image) 
      : await this.callGeminiDirectly(base64Image);

    // 2. Normalize and parse the result
    const items = this.extractAndMapItems(rawExtraction);

    // 3. Assemble the final Invoice object
    return {
      customer_name: this.constants.DEFAULT_CUSTOMER_NAME,
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_number: this.constants.PENDING_INVOICE_NUMBER,
      items
    };

  } catch (err) {
    this.errorHandler.handleError('analyzeInvoiceImage', err, 'Invoice Extraction Error');
    throw err;
  }
}

/** * Transport: Production Proxy 
 */
private async callProxy(base64Image: string): Promise<any> {
  const proxyUrl = environment.proxyUrl; // Keep URLs in environment files!
  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image })
  });

  if (!res.ok) throw new Error(`Proxy request failed (${res.status})`);
  return res.json();
}

/** * Transport: Dev Mode SDK 
 */
private async callGeminiDirectly(base64Image: string): Promise<any> {
  const apiKey = this.getApiKey();
  if (!apiKey) throw new Error(this.constants.ERROR_API_KEY_MISSING);

  const ai = new GoogleGenAI({ apiKey });
  const result = await ai.models.generateContent({
    model: this.constants.GEMINI_MODEL,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: this.constants.GEMINI_PROMPT }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: this.constants.GEMINI_ITEM_SCHEMA,
      temperature: this.constants.GEMINI_TEMPERATURE
    }
  });

  return result;
}

/**
 * Transformation: Normalizes the proxy/SDK response into InvoiceItems
 */
private extractAndMapItems(response: any): InvoiceItem[] {
  // 1. If the proxy already returned a parsed array (from res.json)
  if (Array.isArray(response)) {
    return this.mapToInvoiceItems(response);
  }

  // 2. Fallback: If it's a string (common in local dev or older proxy versions)
  let rawData: any;
  try {
    const text = response.text || response.data || response;
    rawData = typeof text === 'string' ? JSON.parse(text) : text;
  } catch (e) {
    console.error('Failed to parse extraction response', response);
    throw new Error(this.constants.ERROR_NO_DATA_EXTRACTED);
  }

  // Ensure what we parsed is actually the array we expect
  if (!Array.isArray(rawData)) {
    // If Gemini returned a wrapper object like { items: [...] }
    if (rawData.items && Array.isArray(rawData.items)) {
      return this.mapToInvoiceItems(rawData.items);
    }
    throw new Error('Response format unrecognized: expected an array.');
  }

  return this.mapToInvoiceItems(rawData);
}

/**
 * Mapping: Pure logic to convert raw extraction to your app's InvoiceItem model
 */
private mapToInvoiceItems(extractedData: ExtractionResult[]): InvoiceItem[] {
  return extractedData.map(item => ({
    index: item.index,
    quantity: item.quantity,
    // Add logic here if you need to look up product names/prices by index
    description: `Item #${item.index}`, 
    price: 0 
  }));
}

  async addInvoice(invoiceData: Partial<Invoice>) {
    try {
      await this.firebaseService.addInvoice(invoiceData);
      this.messageService.success(this.constants.SUCCESS_INVOICE_SAVED);
    } catch (error) {
      this.messageService.error(this.constants.FAILURE_SAVE_INVOICE);
      this.errorHandler.handleError('addInvoice', error);
      throw error;
    }
  }

  private getApiKey(): string {
    if(!environment.production){
      return environment.apiKey;
    }
    console.log("Looking for key name:", this.constants.API_KEY_ENV_VAR);
    console.log("Is it in process.env?", !!process.env[this.constants.API_KEY_ENV_VAR]);
    return typeof process !== 'undefined' ? process.env[this.constants.API_KEY_ENV_VAR] || '' : '';
  }

  private mapToInvoiceItems(rawData: any[]): InvoiceItem[] {
    return rawData.map((item: any) => {
      const catalog = this.catalogService.getCatalogItemByIndex(item.index);
      const unitPrice = catalog ? catalog.unit_price : 0;
      const name = catalog ? catalog.name : `${this.constants.DEFAULT_CATALOG_ITEM_NAME_TEMPLATE}${item.index}`;
      return {
        name: name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: this.calculation.calculateItemTotal(item.quantity, unitPrice),
        catalogId: catalog?.id,
        catalogIndex: item.index
      } as InvoiceItem;
    });
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
