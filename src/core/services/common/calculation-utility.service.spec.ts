import { TestBed } from '@angular/core/testing';
import { CalculationUtilityService } from './calculation-utility.service';
import { InvoiceItem } from '../../models/invoice.model';

describe('CalculationUtilityService', () => {
  let service: CalculationUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateItemTotal', () => {
    it('should multiply quantity and unit price correctly', () => {
      expect(service.calculateItemTotal(2, 5.5)).toBe(11);
      expect(service.calculateItemTotal(0, 10)).toBe(0);
      expect(service.calculateItemTotal(3, 0)).toBe(0);
    });
  });

  describe('calculateTotalAmount', () => {
    it('should sum total_price of all items', () => {
      const items: Partial<InvoiceItem>[] = [
        { total_price: 10 },
        { total_price: 25.5 },
        { total_price: 5 }
      ];
      expect(service.calculateTotalAmount(items as InvoiceItem[])).toBe(40.5);
    });

    it('should return 0 for an empty items array', () => {
      expect(service.calculateTotalAmount([])).toBe(0);
    });

    it('should handle items with missing or undefined total_price', () => {
      const items: any[] = [
        { total_price: 10 },
        { total_price: undefined },
        { total_price: null },
        {}
      ];
      expect(service.calculateTotalAmount(items as InvoiceItem[])).toBe(10);
    });
  });

  describe('groupAndSum', () => {
    it('should group items and sum values correctly', () => {
      const items = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'A', value: 5 },
      ];
      const result = service.groupAndSum(
        items,
        item => item.category,
        item => item.value
      );
      expect(result).toEqual({ 'A': 15, 'B': 20 });
    });
  });

  describe('groupedToSortedArray', () => {
    it('should convert grouped object to sorted array', () => {
      const grouped = { 'A': 15, 'B': 30, 'C': 10 };
      const result = service.groupedToSortedArray(grouped, 'name', 'total');
      expect(result).toEqual([
        { name: 'B', total: 30 },
        { name: 'A', total: 15 },
        { name: 'C', total: 10 }
      ]);
    });

    it('should use default key and value names', () => {
      const grouped = { 'A': 15 };
      const result = service.groupedToSortedArray(grouped);
      expect(result[0]).toEqual({ name: 'A', total: 15 });
    });
  });

  describe('deepClone', () => {
    it('should create a deep copy of an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = service.deepClone(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });
  });

  describe('normalize', () => {
    it('should lowercase and trim string', () => {
      expect(service.normalize('  TEST string  ')).toBe('test string');
    });
  });

  describe('generateId', () => {
    it('should generate a string ID', () => {
      const id = service.generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate different IDs', () => {
      const id1 = service.generateId();
      const id2 = service.generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
