import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService, CatalogItem } from '../../services/catalog.service';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-management.component.html',
  styleUrls: ['./catalog-management.component.css']
})
export class CatalogManagementComponent {
  protected catalogItems = this.catalogService.catalog;
  protected showForm = signal(false);
  protected isEditing = signal(false);
  protected selectedItem = signal<CatalogItem | null>(null);
  protected loading = signal(false);
  protected error = signal('');

  protected formData = signal({
    index: 0,
    name: '',
    description: '',
    unit_price: 0,
    category: ''
  });

  constructor(private catalogService: CatalogService) {}

  openAddForm() {
    this.formData.set({
      index: 0,
      name: '',
      description: '',
      unit_price: 0,
      category: ''
    });
    this.isEditing.set(false);
    this.showForm.set(true);
    this.error.set('');
  }

  openEditForm(item: CatalogItem) {
    this.formData.set({
      index: item.index,
      name: item.name,
      description: item.description || '',
      unit_price: item.unit_price,
      category: item.category || ''
    });
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

  async saveItem() {
    const data = this.formData();
    
    if (!data.index || !data.name || data.unit_price < 0) {
      this.error.set('Please fill in all required fields (Index, Name, Price)');
      return;
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
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteItem(item: CatalogItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;

    this.loading.set(true);
    try {
      await this.catalogService.deleteCatalogItem(item.id!);
    } catch (err) {
      this.error.set('Failed to delete item.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}