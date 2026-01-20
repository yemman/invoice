import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, Timestamp, Firestore } from 'firebase/firestore';
import { Invoice, InvoiceItem } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  // --- Firebase Config ---
  private firebaseConfig = {   
    apiKey: "AIzaSyCq5ULuPXrpI416RT0V4HZDArOh9ogGWMU",
    authDomain: "gen-lang-client-0328863545.firebaseapp.com",
    projectId: "gen-lang-client-0328863545",
    storageBucket: "gen-lang-client-0328863545.firebasestorage.app",
    messagingSenderId: "492842723997",
    appId: "1:492842723997:web:84757e6737e42640ad4274",
    measurementId: "G-63R88DB5T7"
  };

  private app: FirebaseApp | undefined;
  private db: Firestore | undefined;
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

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      this.app = initializeApp(this.firebaseConfig);
      this.db = getFirestore(this.app);
      this.subscribeToInvoices();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      // Use fallback data immediately if DB connection fails
      this.invoicesSignal.set(this.getFallbackData());
    }
  }

  private subscribeToInvoices() {
    if (!this.db) return;

    try {
      // Real-time listener for the invoices collection
      const q = query(collection(this.db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      onSnapshot(q, (snapshot) => {
        const invoices: Invoice[] = [];
        snapshot.forEach((doc) => {
          invoices.push({ id: doc.id, ...doc.data() } as Invoice);
        });
        this.invoicesSignal.set(invoices);
      }, (error) => {
        console.error("Error subscribing to Firebase.", error);
        this.invoicesSignal.set(this.getFallbackData());
      });
    } catch (e) {
      console.error("Error setting up Firestore query", e);
      this.invoicesSignal.set(this.getFallbackData());
    }
  }

  // --- Actions ---

  async analyzeInvoiceImage(base64Image: string): Promise<Partial<Invoice>> {
    const apiKey = typeof process !== 'undefined' ? process.env['API_KEY'] : '';
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
      const items: InvoiceItem[] = rawData.map((item: any) => ({
        name: `Catalog Item #${item.index}`,
        quantity: item.quantity,
        unit_price: 0, // Default as not extracted
        total_price: 0
      }));

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
    if (!this.db) {
        alert("Database is not connected. Changes cannot be saved.");
        return;
    }

    const totalAmount = (invoiceData.items || []).reduce((sum, item) => sum + (item.total_price || 0), 0);
    
    const newInvoice = {
      customer_name: invoiceData.customer_name || 'Unknown Customer',
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      invoice_number: invoiceData.invoice_number || 'UNKNOWN',
      items: invoiceData.items || [],
      totalAmount: totalAmount,
      status: 'verified',
      createdAt: Timestamp.now()
    };

    try {
      await addDoc(collection(this.db, this.COLLECTION_NAME), newInvoice);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save to database. Check console for details.");
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