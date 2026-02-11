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

  constructor(public invoiceService: InvoiceService) {}

  openInvoices(customer: string) {
    this.selectCustomer.emit(customer);
  }
}
