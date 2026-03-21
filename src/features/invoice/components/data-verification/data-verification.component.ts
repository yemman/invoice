
import { Component, input, output, signal, effect, ChangeDetectionStrategy, inject, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Invoice, InvoiceItem } from '../../../../core/models/invoice.model';
import { CalculationUtilityService } from '../../../../core/services/common/calculation-utility.service';
import { CatalogService } from '../../../../core/services/data/catalog.service';
import { InvoiceService } from '../../../../core/services/data/invoice.service';
import { ValidationMessageComponent } from '../../../../shared/components/validation/validation-message.component';
import { ValidationSummaryComponent } from '../../../../shared/components/validation/validation-summary.component';

@Component({
    selector: 'app-data-verification',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ValidationMessageComponent, ValidationSummaryComponent],
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

  // Form Controls for validation
  amountControl = signal(new FormControl(0, [Validators.required, Validators.min(0.01)]));
  dateControl = signal(new FormControl('', Validators.required));

  // Validation summary state
  showValidationSummary = signal(false);

  isFormValid = computed(() => {
    return this.amountControl().valid && this.dateControl().valid && !!this.editableData().id;
  });

  constructor() {
    effect(() => {
      const incoming = this.data();
      this.editableData.set(this.calculation.deepClone(incoming));
      // Update form controls when data changes
      this.amountControl().setValue(this.editableData()?.totalAmount || 0);
      this.dateControl().setValue(this.editableData()?.createdAt || '');

    });
    effect(() => {
      const invoices = this.invoiceService.invoices();
      const customerNames = invoices.map(invoice => invoice.customer_name);
      this.customers.set([...new Set(customerNames)]);
    });
  }

  handleConfirm() {
    this.amountControl().markAsTouched();
    this.dateControl().markAsTouched();

    if (this.isFormValid()) {
      this.showValidationSummary.set(false);
      this.onConfirm.emit(this.editableData());
    } else {
      this.showValidationSummary.set(true);
    }
  }

  recalcItem(item: InvoiceItem) {
    if (item.quantity && item.unit_price) {
      item.total_price = this.calculation.calculateItemTotal(item.quantity, item.unit_price);
    }
    // After recalculating item, we need to update the total amount and the form control
    this.editableData.update(d => ({
        ...d,
        total_amount: this.calculateTotal()
    }));
    this.amountControl().setValue(this.editableData().totalAmount);
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
        if (!item.unit_price) {
          item.unit_price = catalog.unit_price;
          this.recalcItem(item);
        }
      }
    }
  }

  removeItem(index: number) {
    this.editableData.update(d => {
        const newItems = (d.items || []).filter((_, i) => i !== index);
        return {
            ...d,
            items: newItems
        }
    });
    // After removing item, update total amount and form control
    this.editableData.update(d => ({
        ...d,
        total_amount: this.calculateTotal()
    }));
    this.amountControl().setValue(this.editableData().totalAmount);
  }
}
