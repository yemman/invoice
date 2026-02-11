import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../../models/invoice.model';
import { InvoiceDetailComponent } from '../invoice-detail.component';

@Component({
  selector: 'app-customer-invoices',
  standalone: true,
  imports: [CommonModule, InvoiceDetailComponent],
  templateUrl: './customer-invoices.component.html',
  styleUrls: ['./customer-invoices.component.css']
})
export class CustomerInvoicesComponent {
  @Input() customerName: string | null = null;
  @Input() invoices: Invoice[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Invoice>();
  @Output() remove = new EventEmitter<string>();

  protected selectedInvoice = signal<Invoice | null>(null);

  selectInvoice(inv: Invoice) {
    this.selectedInvoice.set(inv);
  }

  requestEdit(inv: Invoice) {
    this.edit.emit(inv);
  }

  requestRemove(id: string | undefined) {
    if (!id) return;
    this.remove.emit(id);
  }

  onClose() {
    this.selectedInvoice.set(null);
    this.close.emit();
  }
}
