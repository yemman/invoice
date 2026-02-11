import { Injectable, signal, computed } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { CatalogItem } from '../models/catalog.model';  

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private db: Firestore;
  private readonly COLLECTION_NAME = 'catalog';
  private catalogSignal = signal<CatalogItem[]>([]);

  readonly catalog = this.catalogSignal.asReadonly();

  readonly totalItems = computed(() => this.catalogSignal().length);

  constructor() {
    this.db = getFirestore();
    this.subscribeToCatalog();
  }

  private subscribeToCatalog() {
    try {
      const q = query(collection(this.db, this.COLLECTION_NAME), orderBy('index', 'asc'));

      onSnapshot(q, (snapshot) => {
        const items: CatalogItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as any) } as CatalogItem);
        });
        this.catalogSignal.set(items);
      }, (error) => {
        console.error("Error subscribing to catalog:", error);
      });
    } catch (e) {
      console.error("Error setting up catalog query", e);
    }
  }

  async addCatalogItem(item: Omit<CatalogItem, 'id' | 'createdAt'>): Promise<void> {
    try {
      // Prevent duplicate index
      const exists = this.catalogSignal().some(i => i.index === item.index);
      if (exists) {
        throw new Error(`Catalog index ${item.index} already exists`);
      }
      await addDoc(collection(this.db, this.COLLECTION_NAME), {
        ...item,
        is_print: (item as any).is_print ?? false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error adding catalog item:", error);
      throw error;
    }
  }

  async updateCatalogItem(id: string, updates: Partial<CatalogItem>): Promise<void> {
    try {
      // If index is being updated, ensure no other item has same index
      if (typeof updates.index === 'number') {
        const conflict = this.catalogSignal().find(i => i.index === updates.index && i.id !== id);
        if (conflict) {
          throw new Error(`Catalog index ${updates.index} already used by another item`);
        }
      }
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating catalog item:", error);
      throw error;
    }
  }

  async deleteCatalogItem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting catalog item:", error);
      throw error;
    }
  }

  getCatalogItemById(id: string): CatalogItem | undefined {
    return this.catalogSignal().find(item => item.id === id);
  }

  getCatalogItemByIndex(index: number): CatalogItem | undefined {
    return this.catalogSignal().find(item => item.index === index);
  }
}