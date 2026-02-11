import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { MessageService } from '../../services/message.service';
import { CatalogService } from '../../services/catalog.service';
import { CatalogManagementComponent } from '../catalog-management/catalog-management.component';
import { CustomerInvoicesComponent } from './customer-invoices/customer-invoices.component';
import { InventorySoldCardComponent } from './inventory-sold-card.component';
import { AccountsReceivableCardComponent } from './accounts-receivable-card/accounts-receivable-card.component';
import { CatalogCardComponent } from './catalog-card/catalog-card.component';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CatalogManagementComponent, CustomerInvoicesComponent, InventorySoldCardComponent, AccountsReceivableCardComponent, CatalogCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  protected invoiceService = inject(InvoiceService);
  protected catalogService = inject(CatalogService);
  protected messageService = inject(MessageService);
  protected showCatalogManagement = signal(false); 
  protected selectedCustomer = signal<string | null>(null);
  protected customerInvoices = computed(() => {
    const name = this.selectedCustomer();
    if (!name) return [] as Invoice[];
    return this.invoiceService.invoices().filter(inv => inv.customer_name === name);
  });

  selectCustomer(name: string) {
    this.selectedCustomer.set(name);
  }

  clearSelection() {
    this.selectedCustomer.set(null);
  }

  toggleCatalogManagement() {
    this.showCatalogManagement.set(!this.showCatalogManagement());
  }

  async onEditInvoice(inv: Invoice) {
    const newName = prompt('Edit customer name', inv.customer_name);
    if (newName === null) return; // cancelled
    const newStatus = prompt('Edit status (verified|draft)', inv.status) || inv.status;
    try {
      await this.invoiceService.updateInvoice(inv.id, { customer_name: newName, status: newStatus as any });
      this.messageService.success('Invoice updated');
    } catch (e) {
      this.messageService.error('Failed to update invoice. See console.');
    }
  }

  async onDeleteInvoice(id: string) {
    const ok = await this.messageService.confirm('Delete this invoice? This cannot be undone.');
    if (!ok) return;
    try {
      await this.invoiceService.deleteInvoice(id);
      this.messageService.success('Invoice deleted');
      // If the selected customer view is open, ensure any selected invoice is cleared
      this.selectedCustomer.set(this.selectedCustomer());
    } catch (e) {
      this.messageService.error('Failed to delete invoice. See console.');
    }
  }
}


