import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, Timestamp, Firestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
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

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      this.app = initializeApp(this.firebaseConfig);
      this.db = getFirestore(this.app);
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }

  isConnected(): boolean {
    return !!this.db;
  }

  subscribeToInvoices(callback: (invoices: Invoice[]) => void, errorCallback: (error: any) => void) {
    if (!this.db) {
      errorCallback(new Error("Database not initialized"));
      return;
    }

    try {
      const q = query(collection(this.db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const invoices: Invoice[] = [];
        snapshot.forEach((doc) => {
          invoices.push({ id: doc.id, ...doc.data() } as Invoice);
        });
        callback(invoices);
      }, (error) => {
        console.error("Error subscribing to Firebase.", error);
        errorCallback(error);
      });
    } catch (e) {
      console.error("Error setting up Firestore query", e);
      errorCallback(e);
    }
  }

  async addInvoice(invoiceData: Partial<Invoice>): Promise<void> {
    if (!this.db) {
      throw new Error("Database is not connected");
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
      throw error;
    }
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    if (!this.db) throw new Error("Database is not connected");
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      // Ensure totalAmount stays consistent if items changed
      if (updates.items) {
        const totalAmount = (updates.items || []).reduce((sum, item) => sum + (item.total_price || 0), 0);
        updates = { ...updates, totalAmount };
      }
      await updateDoc(docRef, updates as any);
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    if (!this.db) throw new Error("Database is not connected");
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }
}