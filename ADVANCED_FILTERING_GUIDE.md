# Advanced Invoice Filtering & Search

A comprehensive filtering and search system for managing invoices with multiple criteria, sorting options, and real-time statistics.

## Features

### 🔍 Search Capabilities
- **Full-text search** across invoice numbers, customer names, and item names
- **Real-time filtering** with instant result updates
- **Case-insensitive** and normalized text matching

### 🎯 Advanced Filters
- **Status filter**: Verified, Draft, or All
- **Date range filter**: From/To date selection
- **Customer filter**: Filter by specific customer name
- **Amount range filter**: Min/Max amount boundaries
- **Active filter badge**: Shows count of applied filters

### 📊 Sorting Options
- **Sort by Date**: Chronological order (ascending/descending)
- **Sort by Amount**: Financial sorting (ascending/descending)
- **Sort by Customer**: Alphabetical customer sorting

### 📈 Real-time Statistics
- Total matching invoices count
- Verified vs. Draft invoices breakdown
- Total revenue from filtered results
- Unique customer count

### 💾 Persistence
- **LocalStorage integration**: Filters persist across browser sessions
- **Automatic restoration**: Previous filters restored on page reload

## Architecture

### Components

#### 1. **InvoiceFilterService** (`invoice-filter.service.ts`)
**Type**: Smart Service (Signals-based)

Manages the filter state and provides computed filtered data.

```typescript
// Filter state management
readonly filters = this.filterSignal.asReadonly();

// Apply filters
applyFilters(newFilters: Partial<InvoiceFilter>): void

// Reset all filters
resetFilters(): void

// Get filtered invoices
filteredInvoices = (invoices: Invoice[]) => computed(...)

// Get statistics
filteredStatistics = (invoices: Invoice[]) => computed(...)
```

**Key Methods**:
- `updateFilter()`: Update single filter property
- `applyFilters()`: Batch update multiple filters
- `resetFilters()`: Clear all active filters
- `activeFilterCount`: Computed signal for badge display

#### 2. **InvoiceFiltersComponent** (`invoice-filters.component.ts`)
**Type**: Presentational (Dumb) Component

Displays filter UI controls and emits filter change events.

**Inputs**:
- `filters`: Current filter state
- `activeFilterCount`: Number of active filters for badge
- `isExpanded`: Show/hide filter panel

**Outputs**:
- `filterChange`: Emitted when user changes any filter
- `reset`: Emitted when user clicks reset
- `toggleExpand`: Emitted to toggle panel visibility

**Features**:
- Collapsible panel design
- Responsive grid layout
- Accessibility labels and ARIA attributes
- Clear visual feedback for active filters

#### 3. **InvoiceSearchComponent** (`invoice-search.component.ts`)
**Type**: Smart (Container) Component

Combines filtering, sorting, and displays results.

**Inputs**:
- `invoices`: Array of invoices to filter

**Outputs**:
- `edit`: Emitted when user wants to edit invoice
- `remove`: Emitted when user wants to delete invoice

**Key Features**:
- Manages local sort state (field, order)
- Computes filtered and sorted results
- Displays expandable invoice details
- Shows real-time statistics
- Persists filters to localStorage

## Filter Interface

```typescript
interface InvoiceFilter {
  searchTerm: string;          // Full-text search
  status: 'all' | 'verified' | 'draft';
  customerName: string;        // Customer filter
  dateFrom: string;           // ISO date string
  dateTo: string;             // ISO date string
  minAmount: number;          // Minimum total amount
  maxAmount: number;          // Maximum total amount
}
```

## Usage

### In Dashboard Component

```typescript
<app-invoice-search
  [invoices]="invoiceService.invoices()"
  (edit)="onEditInvoice($event)"
  (remove)="onDeleteInvoice($event)"
></app-invoice-search>
```

### Access Filter Service

```typescript
import { InvoiceFilterService } from '@core/services/data/invoice-filter.service';

constructor(private filterService: InvoiceFilterService) {}

// Apply filters
this.filterService.applyFilters({
  searchTerm: "INV",
  status: "verified",
  minAmount: 1000
});

// Get filtered results
const filtered = this.filterService.filteredInvoices(invoices)();
```

## UI/UX Highlights

### Responsive Design
- Mobile-friendly filter panel
- Collapsible controls on small screens
- Optimized table display for all screen sizes

### Accessibility
- ARIA labels on all inputs
- Semantic HTML structure
- Keyboard navigation support
- Focus outlines and visual feedback

### Visual Feedback
- Active filter count badge
- Sort direction indicators (↑ ↓)
- Hover effects on interactive elements
- Empty state messaging
- Loading state considerations

### Performance
- Efficient Signal calculations
- Memoized computed values
- No unnecessary re-renders
- Smart component caching

## File Structure

```
src/features/invoice/components/
├── invoice-filters/
│   ├── invoice-filters.component.ts       # Presentational component
│   ├── invoice-filters.component.html     # Filter UI
│   └── invoice-filters.component.css      # Styling & animations
├── invoice-search/
│   ├── invoice-search.component.ts        # Smart container
│   ├── invoice-search.component.html      # Results view
│   └── invoice-search.component.css       # Table & responsiveness
└── ...

src/core/services/data/
└── invoice-filter.service.ts              # Filter state management
```

## Integration Points

### Dashboard
- New "Advanced Search" tab alongside "Dashboard Overview"
- Switch between views without losing filter state

### Existing Features
- Integrates with `InvoiceService`
- Uses `CalculationUtilityService` for text normalization
- Compatible with existing invoice operations (edit, delete)

## Best Practices Implemented

✅ **SCAM Principles**: 100% standalone components
✅ **Smart/Dumb Pattern**: Clear separation of concerns
✅ **Signal-based State**: Reactive, efficient updates
✅ **DRY Principle**: No duplicated filtering logic
✅ **Accessibility**: WCAG compliant controls
✅ **Type Safety**: Full TypeScript typing
✅ **Error Handling**: Graceful localStorage handling
✅ **Performance**: Optimized computed observables

## Future Enhancements

- **Advanced search syntax** (AND, OR operators)
- **Saved filter presets** for quick access
- **Export filtered results** (CSV/PDF)
- **Batch operations** on filtered results
- **Search history** suggestions
- **Custom filter combinations** UI
- **Filter templates** for common searches

## Testing

### Manual Testing Checklist
- [x] Search functionality across all fields
- [x] Filter combinations work correctly
- [x] Sorting works in both directions
- [x] Statistics update accurately
- [x] Responsive layout on mobile
- [x] Filter persistence across reload
- [x] Edge cases (empty results, special characters)
- [x] Performance with large datasets

### Build Status
✅ Compilation: Zero errors
✅ Bundle size: 1.50 MB (334.70 kB transfer)
✅ All imports resolved correctly
