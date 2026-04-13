import { Injectable, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Timestamp, Firestore, orderBy } from 'firebase/firestore';
import { Invoice } from '../../models/invoice.model';
import { environment } from '../../../../environments/environment';
import { FIREBASE_CONFIG } from '../../config/firebase.config';
import { BaseFirebaseService } from './base-firebase.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { AppConstantsService } from '../constants/app-constants.service';
import { CalculationUtilityService } from '../common/calculation-utility.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService extends BaseFirebaseService {
  private app: FirebaseApp | undefined;
  private db: Firestore | undefined;
  private constants = inject(AppConstantsService);
  private calculation = inject(CalculationUtilityService);

  constructor(errorHandler: ErrorHandlerService) {
    super(errorHandler);
    this.initialize();
  }

  private initialize() {
    try {
      this.app = initializeApp(FIREBASE_CONFIG);
      this.db = getFirestore(this.app);
    } catch (error) {
      this.errorHandler.handleError('Firebase initialization', error);
    }
  }

  isConnected(): boolean {
    return !!this.db;
  }

  // TODO (Jules): [Firestore Performance] Add error handling for offline/disconnected states, or use Firestore offline persistence options.
  subscribeToInvoices(callback: (invoices: Invoice[]) => void, errorCallback: (error: any) => void) {
    if (!this.db) {
      errorCallback(new Error(this.constants.ERROR_DATABASE_NOT_INITIALIZED));
      return;
    }

    this.subscribeToCollection<Invoice>(
      this.db,
      this.constants.INVOICES_COLLECTION,
      callback,
      errorCallback,
      orderBy('createdAt', 'desc')
    );
  }

  async addInvoice(invoiceData: Partial<Invoice>): Promise<void> {
    if (!this.db) {
      throw new Error(this.constants.ERROR_DATABASE_NOT_CONNECTED);
    }

    const totalAmount = this.calculation.calculateTotalAmount(invoiceData.items || []);
    const newInvoice = this.buildInvoiceData(invoiceData, totalAmount);

    await this.addDocument(this.db, this.constants.INVOICES_COLLECTION, newInvoice);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    if (!this.db) throw new Error(this.constants.ERROR_DATABASE_NOT_CONNECTED);

    const updateData = { ...updates };
    if (updates.items) {
      updateData.totalAmount = this.calculation.calculateTotalAmount(updates.items);
    }

    await this.updateDocument(this.db, this.constants.INVOICES_COLLECTION, id, updateData);
  }

  async deleteInvoice(id: string): Promise<void> {
    if (!this.db) throw new Error(this.constants.ERROR_DATABASE_NOT_CONNECTED);
    await this.deleteDocument(this.db, this.constants.INVOICES_COLLECTION, id);
  }

  async clearAllInvoices(): Promise<void> {
    if (!this.db) throw new Error(this.constants.ERROR_DATABASE_NOT_CONNECTED);
    await this.clearCollection(this.db, this.constants.INVOICES_COLLECTION);
  }

  private buildInvoiceData(invoiceData: Partial<Invoice>, totalAmount: number) {
    return {
      customer_name: invoiceData.customer_name ,
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      invoice_number: invoiceData.invoice_number || this.constants.DEFAULT_INVOICE_NUMBER,
      items: invoiceData.items || [],
      totalAmount: totalAmount,
      status: this.constants.STATUS_VERIFIED,
      createdAt: Timestamp.now()
    };
  }
}