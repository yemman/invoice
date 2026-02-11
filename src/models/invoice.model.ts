export interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  // Optional link to a catalog item (populated when invoice items are mapped from OCR/index)
  catalogId?: string;
  // The catalog index number (if provided by OCR)
  catalogIndex?: number;
}

export interface Invoice {
  id: string; // Firestore ID
  customer_name: string;
  invoice_date: string;
  invoice_number: string;
  items: InvoiceItem[];
  totalAmount: number; 
  status: 'verified' | 'draft';
  createdAt?: any; 
}