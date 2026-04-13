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
  getDocs,
  writeBatch,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { ErrorHandlerService } from '../common/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class BaseFirebaseService {
  constructor(protected errorHandler: ErrorHandlerService) {}

  // TODO (Jules): [Firestore Performance] Add support for passing explicit Firestore indexes or log a warning if an index is likely needed (e.g., when combining `orderBy` and multiple `where` clauses).
  // TODO (Jules): [Firestore Performance] Ensure that components using `subscribeToCollection` unsubscribe when destroyed to avoid memory leaks and unnecessary reads.
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

  protected async clearCollection(db: Firestore, collectionName: string, ...queryConstraints: any[]): Promise<void> {
    if (!db) {
      throw new Error('Database is not connected');
    }

    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      // Batch delete up to 500 documents at a time
      // TODO (Jules): [Scalability] Hardcoded batch size. Consider moving `500` to an environment variable or AppConstantsService so it can be tuned based on deployment limits.
      const batchSize = 500;
      let batch = writeBatch(db);
      let count = 0;

      for (const docSnapshot of snapshot.docs) {
        batch.delete(docSnapshot.ref);
        count++;

        if (count === batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }
    } catch (error) {
      this.errorHandler.handleError(`clearCollection[${collectionName}]`, error);
      throw error;
    }
  }
}
