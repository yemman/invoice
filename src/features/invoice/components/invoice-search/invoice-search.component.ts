import { Component, Input, Output, EventEmitter, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../../../core/models/invoice.model';
import { InvoiceFilterService } from '../../../../core/services/data/invoice-filter.service';
import { ErrorHandlerService } from '../../../../core/services/common/error-handler.service';
import { InvoiceFiltersComponent } from '../invoice-filters/invoice-filters.component';
import { InvoiceDetailComponent } from '../invoice-detail/invoice-detail.component';
import { exportToCsv } from '../../../../shared/utils/export.utils';

/**
 * Smart (Container) Component
 * Manages filter state and displays filtered invoice results
 * Combines InvoiceFilterService with presentational components
 */
@Component({
  selector: 'app-invoice-search',
  standalone: true,
  imports: [CommonModule, InvoiceFiltersComponent, InvoiceDetailComponent],
  templateUrl: './invoice-search.component.html',
  styleUrls: ['./invoice-search.component.css'],
})
export class InvoiceSearchComponent implements OnInit {
  // TODO (Jules): [Angular 21 Efficiency] Convert @Input() decorator to a signal input (e.g. `invoices = input<Invoice[]>([])`) for better zoneless reactivity.
  @Input() invoices: Invoice[] = [];
  @Output() edit = new EventEmitter<Invoice>();
  @Output() remove = new EventEmitter<string>();
  @Output() create = new EventEmitter<void>();

  private filterService = inject(InvoiceFilterService);
  private errorHandler = inject(ErrorHandlerService);

  // UI State
  protected isFiltersExpanded = signal(false);
  protected selectedInvoice = signal<Invoice | null>(null);
  protected sortBy = signal<'date' | 'amount' | 'customer'>('date');
  protected sortOrder = signal<'asc' | 'desc'>('desc');

  // Public computed signals
  readonly filters = this.filterService.filters;
  readonly activeFilterCount = this.filterService.activeFilterCount;

  readonly filteredInvoices = computed(() => {
    let filtered = this.filterService.filteredInvoices(this.invoices)();

    // Apply sorting
    const sortType = this.sortBy();
    const isAsc = this.sortOrder() === 'asc';

    switch (sortType) {
      case 'date':
        filtered.sort((a, b) => {
          const dateA = new Date(a.invoice_date).getTime();
          const dateB = new Date(b.invoice_date).getTime();
          return isAsc ? dateA - dateB : dateB - dateA;
        });
        break;

      case 'amount':
        filtered.sort((a, b) =>
          isAsc ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount
        );
        break;

      case 'customer':
        filtered.sort((a, b) => {
          const nameA = a.customer_name.toLowerCase();
          const nameB = b.customer_name.toLowerCase();
          return isAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        break;
    }

    return filtered;
  });

  readonly statistics = computed(() => {
    const filtered = this.filteredInvoices();
    return {
      totalCount: filtered.length,
      totalAmount: filtered.reduce((sum, inv) => sum + inv.totalAmount, 0),
      verifiedCount: filtered.filter((inv) => inv.status === 'verified').length,
      draftCount: filtered.filter((inv) => inv.status === 'draft').length,
    };
  });

  ngOnInit(): void {
    // Load any persisted filters from localStorage (optional enhancement)
    this.restoreFilters();
  }

  /**
   * Handle filter changes from the filters component
   */
  onFilterChange(updates: any): void {
    this.filterService.applyFilters(updates);
    this.persistFilters();
  }

  /**
   * Reset all filters
   */
  onResetFilters(): void {
    this.filterService.resetFilters();
    this.persistFilters();
  }

  /**
   * Toggle filter panel
   */
  onToggleExpand(): void {
    this.isFiltersExpanded.update((v) => !v);
  }

  /**
   * Handle sorting changes
   */
  onSortChange(sortType: 'date' | 'amount' | 'customer'): void {
    if (this.sortBy() === sortType) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(sortType);
      this.sortOrder.set('desc');
    }
  }

  /**
   * Select an invoice to view details
   */
  selectInvoice(invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
  }

  exportToCsv(): void {
    const data = this.filteredInvoices();
    const rows = [
      ['Invoice #', 'Customer', 'Date', 'Total Amount', 'Status'],
      ...data.map(invoice => [
        invoice.invoice_number,
        invoice.customer_name,
        invoice.invoice_date,
        invoice.totalAmount,
        invoice.status === 'verified' ? 'Verified' : 'Draft'
      ])
    ];
    exportToCsv('Filtered_Invoices', rows);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedInvoice.set(null);
  }

  /**
   * Emit edit event
   */
  requestEdit(invoice: Invoice): void {
    this.edit.emit(invoice);
  }

  /**
   * Emit delete event
   */
  requestRemove(id: string | undefined): void {
    if (id) {
      this.remove.emit(id);
    }
  }

  /**
   * Persist filters to localStorage for session persistence
   */
  private persistFilters(): void {
    try {
      localStorage.setItem('invoice-filters', JSON.stringify(this.filters()));
    } catch (e) {
      this.errorHandler.handleError('persistFilters', e, 'Failed to persist filters');
    }
  }

  /**
   * Restore filters from localStorage
   */
  private restoreFilters(): void {
    try {
      const stored = localStorage.getItem('invoice-filters');
      if (stored) {
        const filters = JSON.parse(stored);
        this.filterService.applyFilters(filters);
      }
    } catch (e) {
      this.errorHandler.handleError('restoreFilters', e, 'Failed to restore filters');
    }
  }

  /**
   * Get sort icon for visual feedback
   */
  getSortIcon(sorType: string): string {
    if (this.sortBy() !== sorType) return 'fa-sort';
    return this.sortOrder() === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  /**
   * Get sort icon class
   */
  getSortIconClass(sortType: string): string {
    return this.sortBy() === sortType ? 'text-emerald-600' : 'text-slate-400';
  }
}
