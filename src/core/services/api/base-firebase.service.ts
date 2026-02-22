import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { ErrorHandlerService } from '../common/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class BaseFirebaseService {
  constructor(protected errorHandler: ErrorHandlerService) {}

  protected subscribeToCollection<T extends DocumentData>(
    db: Firestore,
    collectionName: string,
    callback: (items: T[]) => void,
    errorCallback: (error: any) => void,
    ...queryConstraints: any[]
  ): void {
    if (!db) {
      const error = new Error('Database not initialized');
      errorCallback(error);
      return;
    }

    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      onSnapshot(
        q,
        (snapshot) => {
          const items: T[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as any as T);
          });
          callback(items);
        },
        (error) => {
          this.errorHandler.handleError(`subscribeToCollection[${collectionName}]`, error);
          errorCallback(error);
        }
      );
    } catch (e) {
      this.errorHandler.handleError(`subscribeToCollection[${collectionName}]`, e, `Failed to set up query for ${collectionName}`);
      errorCallback(e);
    }
  }

  protected async addDocument<T extends DocumentData>(
    db: Firestore,
    collectionName: string,
    data: T
  ): Promise<DocumentReference<DocumentData>> {
    if (!db) {
      throw new Error('Database is not connected');
    }

    try {
      return await addDoc(collection(db, collectionName), data);
    } catch (error) {
      this.errorHandler.handleError(`addDocument[${collectionName}]`, error);
      throw error;
    }
  }

  protected async updateDocument(
    db: Firestore,
    collectionName: string,
    documentId: string,
    updates: DocumentData
  ): Promise<void> {
    if (!db) {
      throw new Error('Database is not connected');
    }

    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, updates);
    } catch (error) {
      this.errorHandler.handleError(`updateDocument[${collectionName}]`, error);
      throw error;
    }
  }

  protected async deleteDocument(
    db: Firestore,
    collectionName: string,
    documentId: string
  ): Promise<void> {
    if (!db) {
      throw new Error('Database is not connected');
    }

    try {
      await deleteDoc(doc(db, collectionName, documentId));
    } catch (error) {
      this.errorHandler.handleError(`deleteDocument[${collectionName}]`, error);
      throw error;
    }
  }
}
