import { Injectable, signal, computed } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface CatalogItem {
  id?: string;
  index: number;
  name: string;
  description?: string;
  unit_price: number;
  category?: string;
  createdAt?: any;
}

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
          items.push({ id: doc.id, ...doc.data() } as CatalogItem);
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
      await addDoc(collection(this.db, this.COLLECTION_NAME), {
        ...item,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error adding catalog item:", error);
      throw error;
    }
  }

  async updateCatalogItem(id: string, updates: Partial<CatalogItem>): Promise<void> {
    try {
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

  getCatalogItemByIndex(index: number): CatalogItem | undefined {
    return this.catalogSignal().find(item => item.index === index);
  }
}