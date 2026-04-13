import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../../core/services/data/invoice.service';
import { ExpandableCardService } from '../../../../../shared/services/expandable-card.service';
import { exportToCsv } from '../../../../../shared/utils/export.utils';

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

  readonly displayedItems = computed(() => {
    const allItems = this.invoiceService.accountsReceivable();
    return this.expandableCard.expanded() ? allItems : allItems.slice(0, 10);
  });

  toggleExpand() {
    this.expandableCard.toggleExpand();
  }

  // TODO (Jules): [Angular 21 Efficiency] Convert `get expanded()` to a `computed` signal or expose the signal directly.
  get expanded() {
    return this.expandableCard.expanded();
  }

  openInvoices(customer: string) {
    this.selectCustomer.emit(customer);
  }

  exportToCsv() {
    const data = this.invoiceService.accountsReceivable();
    const rows = [
      ['Customer', 'Total Owed'],
      ...data.map(client => [
        client.customer,
        client.amount
      ])
    ];
    exportToCsv('Accounts_Receivable', rows);
  }
}
