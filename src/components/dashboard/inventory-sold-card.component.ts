import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-inventory-sold-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-sold-card.component.html',
  styleUrls: ['./inventory-sold-card.component.css']
})
export class InventorySoldCardComponent {
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
}
