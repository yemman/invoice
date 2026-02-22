import { Injectable, signal, computed, inject } from '@angular/core';
import { Firestore, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { CatalogItem } from '../../models/catalog.model';
import { BaseFirebaseService } from '../api/base-firebase.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { AppConstantsService } from '../constants/app-constants.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService extends BaseFirebaseService {
  private db: Firestore;
  private catalogSignal = signal<CatalogItem[]>([]);
  protected errorHandler = inject(ErrorHandlerService);
  private constants = inject(AppConstantsService);

  readonly catalog = this.catalogSignal.asReadonly();
  readonly totalItems = computed(() => this.catalogSignal().length);

  constructor(errorHandler: ErrorHandlerService) {
    super(errorHandler);
    this.db = getFirestore();
    this.subscribeToCatalog();
  }

  private subscribeToCatalog() {
    this.subscribeToCollection<CatalogItem>(
      this.db,
      this.constants.CATALOG_COLLECTION,
      (items) => this.catalogSignal.set(items),
      (error) => this.catalogSignal.set([]),
      orderBy('index', 'asc')
    );
  }

  async addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<void> {
    const exists = this.catalogSignal().some(i => i.index === item.index);
    if (exists) {
      throw new Error(this.constants.VALIDATION_DUPLICATE_INDEX(item.index));
    }

    const newItem = {
      ...item,
      is_print: (item as any).is_print ?? false,
      createdAt: new Date()
    };

    await this.addDocument(this.db, this.constants.CATALOG_COLLECTION, newItem);
  }

  async updateCatalogItem(id: string, updates: Partial<CatalogItem>): Promise<void> {
    if (typeof updates.index === 'number') {
      const conflict = this.catalogSignal().find(i => i.index === updates.index && i.id !== id);
      if (conflict) {
        throw new Error(this.constants.VALIDATION_DUPLICATE_INDEX_CONFLICT(updates.index));
      }
    }
    await this.updateDocument(this.db, this.constants.CATALOG_COLLECTION, id, updates);
  }

  async deleteCatalogItem(id: string): Promise<void> {
    await this.deleteDocument(this.db, this.constants.CATALOG_COLLECTION, id);
  }

  getCatalogItemById(id: string): CatalogItem | undefined {
    return this.catalogSignal().find(item => item.id === id);
  }

  getCatalogItemByIndex(index: number): CatalogItem | undefined {
    return this.catalogSignal().find(item => item.index === index);
  }
}