import { Component, input, output, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceItem } from '../../models/invoice.model';

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

  editableData = signal<Partial<Invoice>>({});

  constructor() {
    effect(() => {
      // Deep copy to disconnect from original reference during edit
      const incoming = this.data();
      this.editableData.set(JSON.parse(JSON.stringify(incoming)));
    });
  }

  recalcItem(item: InvoiceItem) {
    if (item.quantity && item.unit_price) {
      item.total_price = item.quantity * item.unit_price;
    }
  }

  calculateTotal(): number {
    return (this.editableData().items || []).reduce((acc, item) => acc + (item.total_price || 0), 0);
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