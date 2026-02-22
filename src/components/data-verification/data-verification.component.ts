import { Component, input, output, signal, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceItem } from '../../models/invoice.model';
import { CalculationUtilityService } from '../../services/calculation-utility.service';

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
  editableData = signal<Partial<Invoice>>({});

  constructor() {
    effect(() => {
      const incoming = this.data();
      this.editableData.set(this.calculation.deepClone(incoming));
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
      items: [...(d.items || []), { name: '', quantity: 1, unit_price: 0, total_price: 0 }]
    }));
  }

  removeItem(index: number) {
    this.editableData.update(d => ({
      ...d,
      items: (d.items || []).filter((_, i) => i !== index)
    }));
  }
}