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
  constructor(public invoiceService: InvoiceService) {}
}
