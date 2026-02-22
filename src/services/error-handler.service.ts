import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(context: string, error: any, customMessage?: string): void {
    const message = customMessage || `Error in ${context}`;
    console.error(`${message}:`, error);
  }

  handleAsync<T>(context: string, promise: Promise<T>, errorMessage?: string): Promise<T> {
    return promise.catch(error => {
      this.handleError(context, error, errorMessage);
      throw error;
    });
  }

  logWarning(context: string, message: string): void {
    console.warn(`[${context}] ${message}`);
  }
}
