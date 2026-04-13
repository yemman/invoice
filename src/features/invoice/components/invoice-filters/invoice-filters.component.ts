import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceFilter } from '../../../../core/services/data/invoice-filter.service';

/**
 * Presentational (Dumb) Component
 * Displays filter controls and emits filter events
 * Does NOT manage state - parent (Smart Component) does
 */
@Component({
  selector: 'app-invoice-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-filters.component.html',
  styleUrls: ['./invoice-filters.component.css'],
})
export class InvoiceFiltersComponent {
  // TODO (Jules): [Angular 21 Efficiency] Convert @Input() decorators to signal inputs (e.g. `filters = input.required<InvoiceFilter>()`) for better zoneless reactivity.
  @Input() filters!: InvoiceFilter;
  @Input() activeFilterCount: number = 0;
  @Input() isExpanded: boolean = false;

  @Output() filterChange = new EventEmitter<Partial<InvoiceFilter>>();
  @Output() reset = new EventEmitter<void>();
  @Output() toggleExpand = new EventEmitter<void>();

  /**
   * Emit filter updates as user types/changes values
   */
  onSearchTermChange(term: string): void {
    this.filterChange.emit({ searchTerm: term });
  }

  onStatusChange(status: string): void {
    this.filterChange.emit({ status: status as 'all' | 'verified' | 'draft' });
  }

  onCustomerChange(customer: string): void {
    this.filterChange.emit({ customerName: customer });
  }

  onDateFromChange(date: string): void {
    this.filterChange.emit({ dateFrom: date });
  }

  onDateToChange(date: string): void {
    this.filterChange.emit({ dateTo: date });
  }

  onMinAmountChange(amount: string): void {
    this.filterChange.emit({ minAmount: amount ? parseFloat(amount) : 0 });
  }

  onMaxAmountChange(amount: string): void {
    this.filterChange.emit({ maxAmount: amount ? parseFloat(amount) : Infinity });
  }

  onResetFilters(): void {
    this.reset.emit();
  }

  onToggleExpand(): void {
    this.toggleExpand.emit();
  }

  /**
   * Utility: Format number for display
   */
  formatNumber(value: number): string {
    return value === Infinity ? '' : value.toString();
  }
}
