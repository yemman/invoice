import { Injectable, signal, computed, inject } from '@angular/core';
import { Invoice } from '../../models/invoice.model';
import { CalculationUtilityService } from '../common/calculation-utility.service';

export interface InvoiceFilter {
  searchTerm: string;
  status: 'all' | 'verified' | 'draft';
  customerName: string;
  dateFrom: string;
  dateTo: string;
  minAmount: number;
  maxAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceFilterService {
  private calculation = inject(CalculationUtilityService);

  // --- State Signals ---
  private readonly filterSignal = signal<InvoiceFilter>({
    searchTerm: '',
    status: 'all',
    customerName: '',
    dateFrom: '',
    dateTo: '',
    minAmount: 0,
    maxAmount: Infinity,
  });

  // Public read-only access to filters
  readonly filters = this.filterSignal.asReadonly();

  /**
   * Apply multiple filters at once (batch update)
   */
  applyFilters(newFilters: Partial<InvoiceFilter>): void {
    this.filterSignal.update((current) => ({
      ...current,
      ...newFilters,
    }));
  }

  /**
   * Update a single filter property
   */
  updateFilter<K extends keyof InvoiceFilter>(key: K, value: InvoiceFilter[K]): void {
    this.filterSignal.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterSignal.set({
      searchTerm: '',
      status: 'all',
      customerName: '',
      dateFrom: '',
      dateTo: '',
      minAmount: 0,
      maxAmount: Infinity,
    });
  }

  /**
   * Get active filter count (for badge display)
   */
  readonly activeFilterCount = computed(() => {
    const f = this.filterSignal();
    let count = 0;
    if (f.searchTerm.trim()) count++;
    if (f.status !== 'all') count++;
    if (f.customerName.trim()) count++;
    if (f.dateFrom) count++;
    if (f.dateTo) count++;
    if (f.minAmount > 0) count++;
    if (f.maxAmount < Infinity) count++;
    return count;
  });

  /**
   * Filter invoices based on current filter state
   */
  readonly filteredInvoices = (invoices: Invoice[]) =>
    computed(() => {
      const f = this.filterSignal();
      const searchLower = this.calculation.normalize(f.searchTerm);
      const customerLower = this.calculation.normalize(f.customerName);

      return invoices.filter((invoice) => {
        // Search term filter (invoice number, customer name, item names)
        if (searchLower) {
          const matchesInvoiceNumber = this.calculation.normalize(invoice.invoice_number).includes(searchLower);
          const matchesCustomer = this.calculation.normalize(invoice.customer_name).includes(searchLower);
          const matchesItems = invoice.items.some((item) =>
            this.calculation.normalize(item.name).includes(searchLower)
          );

          if (!matchesInvoiceNumber && !matchesCustomer && !matchesItems) {
            return false;
          }
        }

        // Status filter
        if (f.status !== 'all' && invoice.status !== f.status) {
          return false;
        }

        // Customer name filter
        if (customerLower && !this.calculation.normalize(invoice.customer_name).includes(customerLower)) {
          return false;
        }

        // Date range filter
        if (f.dateFrom && new Date(invoice.invoice_date) < new Date(f.dateFrom)) {
          return false;
        }

        if (f.dateTo && new Date(invoice.invoice_date) > new Date(f.dateTo)) {
          return false;
        }

        // Amount range filter
        if (invoice.totalAmount < f.minAmount || invoice.totalAmount > f.maxAmount) {
          return false;
        }

        return true;
      });
    });

  /**
   * Get summary statistics for filtered results
   */
  readonly filteredStatistics = (invoices: Invoice[]) =>
    computed(() => {
      const filtered = this.filteredInvoices(invoices)();

      return {
        totalCount: filtered.length,
        totalAmount: filtered.reduce((sum, inv) => sum + inv.totalAmount, 0),
        verifiedCount: filtered.filter((inv) => inv.status === 'verified').length,
        draftCount: filtered.filter((inv) => inv.status === 'draft').length,
        uniqueCustomers: new Set(filtered.map((inv) => inv.customer_name)).size,
      };
    });
}
