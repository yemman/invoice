import { describe, it, expect, beforeEach } from 'vitest';
import { CalculationUtilityService } from './calculation-utility.service';
import { InvoiceItem } from '../../models/invoice.model';

describe('CalculationUtilityService', () => {
  let service: CalculationUtilityService;

  beforeEach(() => {
    // Arrange: Instantiate the service directly (no TestBed needed for pure services)
    service = new CalculationUtilityService();
  });

  describe('calculateItemTotal', () => {
    it('should calculate the total for positive quantity and price', () => {
      // Act
      const total = service.calculateItemTotal(5, 10);

      // Assert
      expect(total).toBe(50);
    });

    it('should return 0 if quantity is 0', () => {
      // Act
      const total = service.calculateItemTotal(0, 10);

      // Assert
      expect(total).toBe(0);
    });

    it('should handle decimal values properly', () => {
      // Act
      const total = service.calculateItemTotal(2, 10.5);

      // Assert
      expect(total).toBe(21);
    });

    it('should handle negative quantities', () => {
      // Act
      const total = service.calculateItemTotal(-1, 10);

      // Assert
      expect(total).toBe(-10);
    });
  });

  describe('calculateTotalAmount', () => {
    it('should sum up total_prices from an array of items', () => {
      // Arrange
      const items: Partial<InvoiceItem>[] = [
        { total_price: 100 },
        { total_price: 200 },
        { total_price: 50.5 }
      ];

      // Act
      const totalAmount = service.calculateTotalAmount(items as InvoiceItem[]);

      // Assert
      expect(totalAmount).toBe(350.5);
    });

    it('should return 0 for an empty array', () => {
      // Act
      const totalAmount = service.calculateTotalAmount([]);

      // Assert
      expect(totalAmount).toBe(0);
    });

    it('should treat missing or undefined total_price as 0', () => {
      // Arrange
      const items: Partial<InvoiceItem>[] = [
        { total_price: 100 },
        {},
        { total_price: undefined },
        { total_price: 50 }
      ];

      // Act
      const totalAmount = service.calculateTotalAmount(items as InvoiceItem[]);

      // Assert
      expect(totalAmount).toBe(150);
    });
  });

  describe('groupAndSum', () => {
    it('should group items by key and sum their values', () => {
      // Arrange
      const items = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'A', value: 15 }
      ];

      // Act
      const result = service.groupAndSum(
        items,
        (item) => item.category,
        (item) => item.value
      );

      // Assert
      expect(result).toEqual({ A: 25, B: 20 });
    });

    it('should return an empty object when items array is empty', () => {
      // Act
      const result = service.groupAndSum(
        [],
        (item: any) => item.category,
        (item: any) => item.value
      );

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('groupedToSortedArray', () => {
    it('should convert an object to an array and sort it by value descending', () => {
      // Arrange
      const groupedData = {
        'Apples': 50,
        'Oranges': 100,
        'Bananas': 20
      };

      // Act
      const result = service.groupedToSortedArray(groupedData, 'fruit', 'amount');

      // Assert
      expect(result).toEqual([
        { fruit: 'Oranges', amount: 100 },
        { fruit: 'Apples', amount: 50 },
        { fruit: 'Bananas', amount: 20 }
      ]);
    });

    it('should use default key and value names if not provided', () => {
      // Arrange
      const groupedData = { 'Item A': 10, 'Item B': 5 };

      // Act
      const result = service.groupedToSortedArray(groupedData);

      // Assert
      expect(result).toEqual([
        { name: 'Item A', total: 10 },
        { name: 'Item B', total: 5 }
      ]);
    });

    it('should handle an empty object', () => {
      // Act
      const result = service.groupedToSortedArray({});

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('deepClone', () => {
    it('should create a separate cloned object', () => {
      // Arrange
      const original = { a: 1, b: { c: 2 } };

      // Act
      const clone = service.deepClone(original);

      // Assert
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b); // Nested objects are cloned
    });

    it('should handle null values correctly', () => {
      // Act
      const clone = service.deepClone(null);

      // Assert
      expect(clone).toBeNull();
    });
  });

  describe('normalize', () => {
    it('should lowercase and trim string', () => {
      // Arrange
      const input = '   HeLlO wOrLd   ';

      // Act
      const result = service.normalize(input);

      // Assert
      expect(result).toBe('hello world');
    });

    it('should return empty string for empty input', () => {
      // Act
      const result = service.normalize('');

      // Assert
      expect(result).toBe('');
    });

    it('should handle strings with only spaces', () => {
      // Act
      const result = service.normalize('     ');

      // Assert
      expect(result).toBe('');
    });
  });

  describe('generateId', () => {
    it('should return a string of expected length', () => {
      // Act
      const id = service.generateId();

      // Assert
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique ids', () => {
      // Act
      const id1 = service.generateId();
      const id2 = service.generateId();

      // Assert
      expect(id1).not.toBe(id2);
    });
  });
});
