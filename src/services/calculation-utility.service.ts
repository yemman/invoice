import { Injectable } from '@angular/core';
import { InvoiceItem } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationUtilityService {
  /**
   * Calculate total price for an invoice item
   */
  calculateItemTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  /**
   * Calculate total amount from invoice items
   */
  calculateTotalAmount(items: InvoiceItem[]): number {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  }

  /**
   * Group items by key and sum their quantities
   */
  groupAndSum<T>(items: T[], keyExtractor: (item: T) => string, valueExtractor: (item: T) => number): Record<string, number> {
    const result: Record<string, number> = {};
    items.forEach(item => {
      const key = keyExtractor(item);
      result[key] = (result[key] || 0) + valueExtractor(item);
    });
    return result;
  }

  /**
   * Convert grouped data to sorted array
   */
  groupedToSortedArray(grouped: Record<string, number>, keyName = 'name', valueName = 'total'): Array<any> {
    return Object.entries(grouped)
      .map(([key, value]) => ({ [keyName]: key, [valueName]: value }))
      .sort((a, b) => (b[valueName] as number) - (a[valueName] as number));
  }

  /**
   * Deep clone an object
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Normalize string for comparison (lowercase and trimmed)
   */
  normalize(str: string): string {
    return str.toLowerCase().trim();
  }

  /**
   * Generate UUID-like ID
   */
  generateId(): string {
    return Math.random().toString(36).slice(2, 11);
  }
}
