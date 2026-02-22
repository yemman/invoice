import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { ExpandableCardService } from '../../services/expandable-card.service';

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
}
