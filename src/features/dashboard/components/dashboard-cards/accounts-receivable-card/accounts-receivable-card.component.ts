import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../../core/services/data/invoice.service';
import { ExpandableCardService } from '../../../../../shared/services/expandable-card.service';

@Component({
  selector: 'app-accounts-receivable-card',
  standalone: true,
  imports: [CommonModule],
  providers: [ExpandableCardService],
  templateUrl: './accounts-receivable-card.component.html',
  styleUrls: ['./accounts-receivable-card.component.css']
})
export class AccountsReceivableCardComponent {
  @Output() selectCustomer = new EventEmitter<string>();
  @Output() newInvoice = new EventEmitter<void>();
  protected expandableCard = inject(ExpandableCardService);

  constructor(public invoiceService: InvoiceService) {}

  toggleExpand() {
    this.expandableCard.toggleExpand();
  }

  get expanded() {
    return this.expandableCard.expanded();
  }

  openInvoices(customer: string) {
    this.selectCustomer.emit(customer);
  }
}
