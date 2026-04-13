import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/data/invoice.service';
import { MessageService } from '../../../../core/services/common/message.service';
import { CatalogService } from '../../../../core/services/data/catalog.service';
import { CatalogManagementComponent } from '../../../catalog/components/catalog-management/catalog-management.component';
import { CustomerInvoicesComponent } from '../customer-invoices/customer-invoices.component';
import { InventorySoldCardComponent } from '../dashboard-cards/inventory-sold-card/inventory-sold-card.component';
import { AccountsReceivableCardComponent } from '../dashboard-cards/accounts-receivable-card/accounts-receivable-card.component';
import { CatalogCardComponent } from '../dashboard-cards/catalog-card/catalog-card.component';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CatalogManagementComponent, CustomerInvoicesComponent, InventorySoldCardComponent, AccountsReceivableCardComponent, CatalogCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @Output() manualInvoice = new EventEmitter<void>();
  @Output() editInvoice = new EventEmitter<Invoice>();

  protected invoiceService = inject(InvoiceService);
  protected catalogService = inject(CatalogService);
  protected messageService = inject(MessageService);
  protected showCatalogManagement = signal(false); 
  protected selectedCustomer = signal<string | null>(null);
  // TODO (Jules): [Scalability] Heavy client-side filtering. If `invoices()` array scales past ~10,000 items, this will bottleneck the browser. Consider delegating to a backend search service or paginated Firestore queries.
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

  onEditInvoice(inv: Invoice) {
    // forward to parent for full verification/edit form
    this.editInvoice.emit(inv);
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


