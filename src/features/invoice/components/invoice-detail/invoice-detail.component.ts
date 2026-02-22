import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent {
  @Input() invoice: Invoice | null = null;
  @Output() edit = new EventEmitter<Invoice>();

  requestEdit() {
    if (!this.invoice) return;
    this.edit.emit(this.invoice);
  }
}
