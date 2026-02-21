import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../services/invoice.service';

@Component({
  selector: 'app-accounts-receivable-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts-receivable-card.component.html',
  styleUrls: ['./accounts-receivable-card.component.css']
})
export class AccountsReceivableCardComponent {
  @Output() selectCustomer = new EventEmitter<string>();

  expanded = false;

  constructor(public invoiceService: InvoiceService) {}

  toggleExpand() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  openInvoices(customer: string) {
    this.selectCustomer.emit(customer);
  }
}
