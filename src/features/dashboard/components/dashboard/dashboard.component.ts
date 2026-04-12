import { Component, inject, signal, computed, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../../../core/services/data/invoice.service';
import { MessageService } from '../../../../core/services/common/message.service';
import { CatalogService } from '../../../../core/services/data/catalog.service';
import { CatalogManagementComponent } from '../../../catalog/components/catalog-management/catalog-management.component';
import { CustomerInvoicesComponent } from '../customer-invoices/customer-invoices.component';
import { InventorySoldCardComponent } from '../dashboard-cards/inventory-sold-card/inventory-sold-card.component';
import { AccountsReceivableCardComponent } from '../dashboard-cards/accounts-receivable-card/accounts-receivable-card.component';
import { CatalogCardComponent } from '../dashboard-cards/catalog-card/catalog-card.component';
import { Invoice } from '../../../../core/models/invoice.model';
import { InvoiceSearchComponent } from '../../../invoice/components/invoice-search/invoice-search.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CatalogManagementComponent,
    CustomerInvoicesComponent,
    InventorySoldCardComponent,
    AccountsReceivableCardComponent,
    CatalogCardComponent,
    InvoiceSearchComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Output() manualInvoice = new EventEmitter<void>();
  @Output() editInvoice = new EventEmitter<Invoice>();

  protected invoiceService = inject(InvoiceService);
  protected catalogService = inject(CatalogService);
  protected messageService = inject(MessageService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);

  protected activeTab = signal<'overview' | 'catalog' | 'history'>('overview');
  protected selectedCustomer = signal<string | null>(null);
  protected customerInvoices = computed(() => {
    const name = this.selectedCustomer();
    if (!name) return [] as Invoice[];
    return this.invoiceService.invoices().filter(inv => inv.customer_name === name);
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'overview' || tab === 'catalog' || tab === 'history') {
        this.activeTab.set(tab);
      } else if (!tab) {
        this.activeTab.set('overview');
      }
    });
  }

  selectCustomer(name: string) {
    this.selectedCustomer.set(name);
  }

  clearSelection() {
    this.selectedCustomer.set(null);
  }

  setActiveTab(tab: 'overview' | 'catalog' | 'history') {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge'
    });
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


