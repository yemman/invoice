import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../../core/services/data/invoice.service';
import { ExpandableCardService } from '../../../../../shared/services/expandable-card.service';
import { exportToCsv } from '../../../../../shared/utils/export.utils';

@Component({
  selector: 'app-inventory-sold-card',
  standalone: true,
  imports: [CommonModule],
  providers: [ExpandableCardService],
  templateUrl: './inventory-sold-card.component.html',
  styleUrls: ['./inventory-sold-card.component.css']
})
export class InventorySoldCardComponent {
  protected expandableCard = inject(ExpandableCardService);

  constructor(public invoiceService: InvoiceService) {}

  toggleExpand() {
    this.expandableCard.toggleExpand();
  }

  get expanded() {
    return this.expandableCard.expanded();
  }

  exportToCsv() {
    const data = this.invoiceService.inventoryNeeds();
    const rows = [
      ['Product Name', 'Units Sold', 'Demand Level'],
      ...data.map(item => [
        item.name,
        item.total,
        `${((item.total / 100) * 100).toFixed(2)}%`
      ])
    ];
    exportToCsv('Inventory_Sold', rows);
  }
}
