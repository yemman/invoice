import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConstantsService {
  // Collection Names
  readonly INVOICES_COLLECTION = 'invoices';
  readonly CATALOG_COLLECTION = 'catalog';

  // Statuses
  readonly STATUS_VERIFIED = 'verified';
  readonly STATUS_DRAFT = 'draft';

  // Default Values
  readonly DEFAULT_CUSTOMER_NAME = 'Unknown Customer';
  readonly DEFAULT_INVOICE_NUMBER = 'UNKNOWN';
  readonly DEFAULT_CATALOG_ITEM_NAME_TEMPLATE = 'Catalog Item #';
  readonly PENDING_INVOICE_NUMBER = 'PENDING';

  // API
  readonly GEMINI_MODEL = 'gemini-2.5-flash';
  readonly API_KEY_ENV_VAR = 'API_KEY';

  // Error Messages
  readonly ERROR_DATABASE_NOT_INITIALIZED = 'Database not initialized';
  readonly ERROR_DATABASE_NOT_CONNECTED = 'Database is not connected';
  readonly ERROR_AUTH_NOT_INITIALIZED = 'Auth not initialized';
  readonly ERROR_NO_DATA_EXTRACTED = 'No data extracted';
  readonly ERROR_API_KEY_MISSING = 'API Key is missing';

  // Success Messages
  readonly SUCCESS_INVOICE_SAVED = 'Invoice saved';
  readonly SUCCESS_INVOICE_UPDATED = 'Invoice updated';
  readonly SUCCESS_INVOICE_DELETED = 'Invoice deleted';
  readonly SUCCESS_CATALOG_ITEM_ADDED = 'Catalog item added';
  readonly SUCCESS_CATALOG_ITEM_UPDATED = 'Catalog item updated';
  readonly SUCCESS_CATALOG_ITEM_DELETED = 'Catalog item deleted';

  // Failure Messages
  readonly FAILURE_SAVE_INVOICE = 'Failed to save to database. Check console for details.';
  readonly FAILURE_UPDATE_INVOICE = 'Failed to update invoice. See console.';
  readonly FAILURE_DELETE_INVOICE = 'Failed to delete invoice. See console.';
  readonly FAILURE_ADD_CATALOG = 'Failed to add catalog item. See console.';
  readonly FAILURE_UPDATE_CATALOG = 'Failed to update catalog item. See console.';
  readonly FAILURE_DELETE_CATALOG = 'Failed to delete catalog item. See console.';

  // Validation Messages
  readonly VALIDATION_DUPLICATE_INDEX = (index: number) => `Catalog index ${index} already exists`;
  readonly VALIDATION_DUPLICATE_INDEX_CONFLICT = (index: number) => `Catalog index ${index} already used by another item`;

  // Currency
  readonly CURRENCY_ILS = 'ILS';

  // Temperature Settings
  readonly GEMINI_TEMPERATURE = 0.1;

  // Schema Templates
  readonly GEMINI_ITEM_SCHEMA = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        index: { type: 'INTEGER' },
        quantity: { type: 'INTEGER' }
      },
      required: ['index', 'quantity']
    }
  };

  readonly GEMINI_PROMPT = "You are an OCR expert. Analyze the provided image of a flatware invoice. Look at the far-right column for the index number (1-999). Look at the far-left column for handwritten quantities. These are the items the customer wants. Extract only the rows where there is a handwritten value in the far-left column. Return a JSON array of objects with these keys: index and quantity. Ensure that a handwritten '4' next to index '13' is correctly mapped as { 'index': 13, 'quantity': 4 }.";
}
