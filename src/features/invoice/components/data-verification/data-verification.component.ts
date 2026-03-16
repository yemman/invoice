import { Component, input, output, signal, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceItem } from '../../../../core/models/invoice.model';
import { CalculationUtilityService } from '../../../../core/services/common/calculation-utility.service';
import { CatalogService } from '../../../../core/services/data/catalog.service';
import { InvoiceService } from '../../../../core/services/data/invoice.service';

@Component({
    selector: 'app-data-verification',
    imports: [CommonModule, FormsModule],
    templateUrl: './data-verification.component.html',
    styleUrl: './data-verification.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataVerificationComponent {
  data = input.required<Partial<Invoice>>();
  onConfirm = output<Partial<Invoice>>();
  onCancel = output<void>();

  protected calculation = inject(CalculationUtilityService);
  protected catalogService = inject(CatalogService);
  protected invoiceService = inject(InvoiceService);
  editableData = signal<Partial<Invoice>>({});
  customers = signal<string[]>([]);

  constructor() {
    effect(() => {
      const incoming = this.data();
      this.editableData.set(this.calculation.deepClone(incoming));
    });
    this.invoiceService.invoices.subscribe(invoices => {
      const customerNames = invoices.map(invoice => invoice.customer_name);
      this.customers.set([...new Set(customerNames)]);
    });
  }

  recalcItem(item: InvoiceItem) {
    if (item.quantity && item.unit_price) {
      item.total_price = this.calculation.calculateItemTotal(item.quantity, item.unit_price);
    }
  }

  calculateTotal(): number {
    return this.calculation.calculateTotalAmount(this.editableData().items || []);
  }

  addItem() {
    this.editableData.update(d => ({
      ...d,
      items: [...(d.items || []), { name: '', quantity: 1, unit_price: 0, total_price: 0, catalogIndex: undefined }]
    }));
  }

  onCatalogIndexChange(item: InvoiceItem) {
    const idx = item.catalogIndex;
    if (typeof idx === 'number' && idx > 0) {
      const catalog = this.catalogService.getCatalogItemByIndex(idx);
      if (catalog) {
        item.name = catalog.name;
        // fill unit_price if the user hasn't already entered a value
        if (!item.unit_price) {
          item.unit_price = catalog.unit_price;
          this.recalcItem(item);
        }
      }
    }
  }

  removeItem(index: number) {
    this.editableData.update(d => ({
      ...d,
      items: (d.items || []).filter((_, i) => i !== index)
    }));
  }
}
