import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    // Arrange: Instantiate the pure service
    service = new ErrorHandlerService();

    // Spy on console methods to prevent actual logging during tests and to assert calls
    vi.spyOn(console, 'error').mockImplementation(() => {}); vi.mocked(console.error).mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => {}); vi.mocked(console.warn).mockClear();
  });

  describe('handleError', () => {
    it('should log an error with the provided context and default message', () => {
      // Arrange
      const context = 'AuthService';
      const error = new Error('Network timeout');

      // Act
      service.handleError(context, error);

      // Assert
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, error);
    });

    it('should log an error with a custom message if provided', () => {
      // Arrange
      const context = 'InvoiceService';
      const error = { code: 500 };
      const customMessage = 'Failed to fetch invoices';

      // Act
      service.handleError(context, error, customMessage);

      // Assert
      expect(console.error).toHaveBeenCalledWith(`${customMessage}:`, error);
    });

    it('should handle null or undefined error objects gracefully', () => {
      // Arrange
      const context = 'SomeContext';

      // Act
      service.handleError(context, null);
      service.handleError(context, undefined);

      // Assert
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, null);
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, undefined);
    });
  });

  describe('handleAsync', () => {
    it('should return the resolved value if the promise is successful', async () => {
      // Arrange
      const expectedValue = { id: 1 };
      const promise = Promise.resolve(expectedValue);

      // Act
      const result = await service.handleAsync('TestContext', promise);

      // Assert
      expect(result).toBe(expectedValue);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should log the error and re-throw if the promise is rejected', async () => {
      // Arrange
      const context = 'AsyncOperation';
      const error = new Error('Async failure');
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(service.handleAsync(context, promise)).rejects.toThrow('Async failure');
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, error);
    });

    it('should use the custom error message when rejecting', async () => {
      // Arrange
      const context = 'AsyncOperation';
      const customMessage = 'Custom async error message';
      const error = new Error('Async failure');
      const promise = Promise.reject(error);

      // Act & Assert
      await expect(service.handleAsync(context, promise, customMessage)).rejects.toThrow('Async failure');
      expect(console.error).toHaveBeenCalledWith(`${customMessage}:`, error);
    });
  });

  describe('logWarning', () => {
    it('should log a warning with the correct format', () => {
      // Arrange
      const context = 'Validation';
      const message = 'Invalid invoice format';

      // Act
      service.logWarning(context, message);

      // Assert
      expect(console.warn).toHaveBeenCalledWith(`[${context}] ${message}`);
    });

    it('should handle empty strings for context and message', () => {
      // Arrange
      const context = '';
      const message = '';

      // Act
      service.logWarning(context, message);

      // Assert
      expect(console.warn).toHaveBeenCalledWith(`[] `);
    });
  });
});
