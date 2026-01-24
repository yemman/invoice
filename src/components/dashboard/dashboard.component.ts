import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { CatalogService } from '../../services/catalog.service';
import { CatalogManagementComponent } from '../catalog-management/catalog-management.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CatalogManagementComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  protected invoiceService = inject(InvoiceService);
  protected catalogService = inject(CatalogService);
  protected showCatalogManagement = signal(false); 

  toggleCatalogManagement() {
    this.showCatalogManagement.set(!this.showCatalogManagement());
  }
}


