import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../../core/services/data/catalog.service';
import { InvoiceService } from '../../../../core/services/data/invoice.service';
import { MessageService } from '../../../../core/services/common/message.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-settings.component.html'
})
export class SystemSettingsComponent {
  private catalogService = inject(CatalogService);
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);

  async clearCatalog() {
    const confirmed = await this.messageService.confirm(
      'Are you sure you want to delete all catalog items? This action cannot be undone and will permanently wipe your catalog data.',
      { type: 'danger', challengeText: 'CLEAR CATALOG' }
    );

    if (confirmed) {
      try {
        await this.catalogService.clearAllCatalogItems();
        this.messageService.success('Catalog cleared successfully.');
      } catch (error) {
        this.messageService.error('Failed to clear catalog.');
      }
    }
  }

  async clearInvoices() {
    const confirmed = await this.messageService.confirm(
      'Are you sure you want to delete all invoices? This action cannot be undone and will permanently wipe your invoice data.',
      { type: 'danger', challengeText: 'CLEAR INVOICES' }
    );

    if (confirmed) {
      try {
        await this.invoiceService.clearAllInvoices();
        this.messageService.success('Invoices cleared successfully.');
      } catch (error) {
        this.messageService.error('Failed to clear invoices.');
      }
    }
  }
}
