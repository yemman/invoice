import { Component, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/data/catalog.service';
import { MessageService } from '../../../../core/services/common/message.service';
import { CatalogItem } from '../../../../core/models/catalog.model';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-management.component.html',
  styleUrls: ['./catalog-management.component.css']
})
export class CatalogManagementComponent {
  @Output() close = new EventEmitter<void>();
  protected catalogItems = this.catalogService.catalog;
  protected searchQuery = signal('');
  protected filteredCatalogItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.catalogItems();
    return this.catalogItems().filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.index.toString().includes(query) ||
      item.id?.toLowerCase().includes(query)
    );
  });
  protected showForm = signal(false);
  protected isEditing = signal(false);
  protected selectedItem = signal<CatalogItem | null>(null);
  protected loading = signal(false);
  protected error = signal('');

  protected formData = signal({
    index: 0,
    name: '',
    box_quantety: 0,
    unit_price: 0,
    is_print: false
  });

  constructor(private catalogService: CatalogService, private messageService: MessageService) {}

  requestClose() {
    this.close.emit();
  }

  openAddForm() {
    this.formData.set({ index: 0, name: '', box_quantety: 0, unit_price: 0, is_print: false });
    this.isEditing.set(false);
    this.showForm.set(true);
    this.error.set('');
  }

  openEditForm(item: CatalogItem) {
    this.formData.set({ index: item.index, name: item.name, box_quantety: item.box_quantety || 0, unit_price: item.unit_price, is_print: item.is_print ?? false });
    this.selectedItem.set(item);
    this.isEditing.set(true);
    this.showForm.set(true);
    this.error.set('');
  }

  closeForm() {
    this.showForm.set(false);
    this.selectedItem.set(null);
    this.error.set('');
  }

  // TODO (Jules): [Security & Validation] Sanitize user inputs (e.g., `data.name`) before saving to Firestore to prevent XSS if displayed outside Angular context.
  async saveItem() {
    const data = this.formData();
    
    if (!data.name || data.unit_price < 0 || !data.index) {
      this.error.set('Please fill in all required fields (Index, Name, Price)');
      return;
    }

    // Check duplicate index locally for quick feedback
    const existing = this.catalogService.getCatalogItemByIndex(data.index);
    if (!this.isEditing() && existing) {
      this.error.set(`Index ${data.index} already exists`);
      this.loading.set(false);
      return;
    }
    if (this.isEditing() && this.selectedItem()) {
      if (existing && existing.id !== this.selectedItem()!.id) {
        this.error.set(`Index ${data.index} already used by another item`);
        this.loading.set(false);
        return;
      }
    }

    this.loading.set(true);
    try {
      if (this.isEditing() && this.selectedItem()) {
        await this.catalogService.updateCatalogItem(this.selectedItem()!.id!, data);
      } else {
        await this.catalogService.addCatalogItem(data);
      }
      this.closeForm();
    } catch (err) {
      this.error.set('Failed to save item. Try again.');
      // TODO (Jules): [Security & Validation] Ensure sensitive error details are not logged directly. Use `ErrorHandlerService` to format and sanitize error logs.
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteItem(item: CatalogItem) {
    const ok = await this.messageService.confirm(`Delete "${item.name}"?`);
    if (!ok) return;

    this.loading.set(true);
    try {
      await this.catalogService.deleteCatalogItem(item.id!);
      this.messageService.success('Catalog item deleted');
    } catch (err) {
      this.error.set('Failed to delete item.');
      this.messageService.error('Failed to delete item.');
      // TODO (Jules): [Security & Validation] Ensure sensitive error details are not logged directly. Use `ErrorHandlerService` to format and sanitize error logs.
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}