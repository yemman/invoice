# Folder Structure Organization

## New Project Structure

This document outlines the reorganized folder structure for better scalability and maintainability.

### Before Organization
```
src/
├── app.component.ts
├── components/ (11 components mixed together)
├── services/ (9 services all at root level)
├── models/ (2 models)
└── config/ (1 config file)
```

### After Organization

```
src/
├── app/                           # Root application component
│   ├── app.component.ts
│   ├── app.component.html
│   └── app.component.css
│
├── core/                          # Singleton services, models, config (bootstrapped at app level)
│   ├── config/
│   │   └── firebase.config.ts
│   │
│   ├── models/
│   │   ├── catalog.model.ts
│   │   └── invoice.model.ts
│   │
│   └── services/                  # Organized by functional domain
│       ├── api/                   # External API integrations
│       │   ├── auth.service.ts
│       │   ├── base-firebase.service.ts
│       │   └── firebase.service.ts
│       │
│       ├── data/                  # Business logic & data management
│       │   ├── catalog.service.ts
│       │   └── invoice.service.ts
│       │
│       ├── common/                # Utility & general services
│       │   ├── calculation-utility.service.ts
│       │   ├── error-handler.service.ts
│       │   └── message.service.ts
│       │
│       └── constants/             # Application constants
│           └── app-constants.service.ts
│
├── shared/                        # Shared across features (reusable components & services)
│   ├── components/
│   │   ├── confirm-modal.component.ts
│   │   └── message-toast.component.ts
│   │
│   ├── services/
│   │   └── expandable-card.service.ts   # Component-scoped, not singleton
│   │
│   └── utils/                     # Shared utility functions (future)
│
├── features/                      # Feature-specific components & logic (lazy loadable)
│   │
│   ├── auth/
│   │   └── components/
│   │       └── login/
│   │           ├── login.component.ts
│   │           ├── login.component.html
│   │           └── login.component.css
│   │
│   ├── invoice/
│   │   └── components/
│   │       ├── invoice-uploader/
│   │       │   ├── invoice-uploader.component.ts
│   │       │   ├── invoice-uploader.component.html
│   │       │   └── invoice-uploader.component.css
│   │       │
│   │       ├── data-verification/
│   │       │   ├── data-verification.component.ts
│   │       │   ├── data-verification.component.html
│   │       │   └── data-verification.component.css
│   │       │
│   │       └── invoice-detail/
│   │           ├── invoice-detail.component.ts
│   │           ├── invoice-detail.component.html
│   │           └── invoice-detail.component.css
│   │
│   ├── dashboard/
│   │   └── components/
│   │       ├── dashboard/
│   │       │   ├── dashboard.component.ts
│   │       │   ├── dashboard.component.html
│   │       │   └── dashboard.component.css
│   │       │
│   │       ├── dashboard-cards/
│   │       │   ├── inventory-sold-card/
│   │       │   │   ├── inventory-sold-card.component.ts
│   │       │   │   ├── inventory-sold-card.component.html
│   │       │   │   └── inventory-sold-card.component.css
│   │       │   │
│   │       │   ├── accounts-receivable-card/
│   │       │   │   ├── accounts-receivable-card.component.ts
│   │       │   │   ├── accounts-receivable-card.component.html
│   │       │   │   └── accounts-receivable-card.component.css
│   │       │   │
│   │       │   └── catalog-card/
│   │       │       ├── catalog-card.component.ts
│   │       │       ├── catalog-card.component.html
│   │       │       └── catalog-card.component.css
│   │       │
│   │       └── customer-invoices/
│   │           ├── customer-invoices.component.ts
│   │           ├── customer-invoices.component.html
│   │           └── customer-invoices.component.css
│   │
│   └── catalog/
│       └── components/
│           └── catalog-management/
│               ├── catalog-management.component.ts
│               ├── catalog-management.component.html
│               └── catalog-management.component.css
│
└── styles.css                     # Global styles
```

---

## Architecture Principles

### 1. **app/** - Root Level
- Contains only the root `AppComponent`
- Handles main application layout and routing
- Imports from features, shared, and core

### 2. **core/** - Singleton Services & Configuration
- **Bootstrapped at app level** - Only initialized once
- **Not lazy-loadable** - Always loaded with the app
- Organized by responsibility:
  - **api/** - External service integrations (Firebase, Auth)
  - **data/** - Business logic & domain services
  - **common/** - Utilities and general-purpose services
  - **constants/** - Application constants and configuration

### 3. **shared/** - Reusable Across Features
- **Shared components** - UI components used by multiple features
- **Shared services** - Component-scoped services (not singletons)
- **Shared utilities** - Helper functions for future use

### 4. **features/** - Feature Modules
- **Self-contained** - Each feature is independent
- **Lazy-loadable** - Can be loaded on-demand with routing
- **Clear hierarchy** - Feature > Components > Subcomponents
- Each feature can have its own:
  - Components
  - Local services (future)
  - Routes (future)
  - Pipes/Directives (future)

---

## Benefits of This Organization

| Benefit | Description |
|---------|-------------|
| **Scalability** | Easy to add new features without cluttering |
| **Lazy Loading** | Features can be code-split and loaded on-demand |
| **Maintainability** | Clear separation of concerns |
| **Testability** | Easy to isolate and test individual features |
| **Code Reuse** | Shared components & services in dedicated folder |
| **Performance** | Tree-shaking works better with clear module boundaries |
| **Developer Experience** | Clear folder naming = easy to navigate |

---

## Import Paths Convention

### From Features to Core
```typescript
// In: src/features/invoice/components/invoice-uploader/invoice-uploader.component.ts

// ✅ Import from core services
import { InvoiceService } from '../../../../core/services/data/invoice.service';

// ✅ Import from core models  
import { Invoice } from '../../../../core/models/invoice.model';

// ✅ Import from shared components
import { MessageToastComponent } from '../../../../shared/components/message-toast.component';
```

### From Core Services
```typescript
// In: src/core/services/data/invoice.service.ts

// ✅ Import from other core services
import { FirebaseService } from '../api/firebase.service';
import { MessageService } from '../common/message.service';

// ✅ Import from core models
import { Invoice } from '../../models/invoice.model';

// ✅ Import from environments (root level)
import { environment } from '../../../../environments/environment';
```

### From Shared
```typescript
// In: src/shared/components/message-toast.component.ts

// ✅ Import from core services
import { MessageService } from '../../core/services/common/message.service';

// ✅ Import from core models
import { Invoice } from '../../core/models/invoice.model';
```

---

## Migration Path for New Code

When adding new features:

1. **Create feature folder**
   ```bash
   mkdir -p src/features/my-feature/components
   ```

2. **Add components inside feature**
   ```bash
   mkdir src/features/my-feature/components/my-component
   ```

3. **Import from core & shared**
   ```typescript
   import { CoreService } from '../../core/services/data/core.service';
   import { SharedComponent } from '../../shared/components/shared.component';
   ```

4. **Keep feature-specific services in feature** (future)
   ```bash
   src/features/my-feature/services/my-local.service.ts
   ```

---

## Future Enhancements

1. **Lazy Loading with Routes**
   ```typescript
   const routes: Routes = [
     {
       path: 'invoice',
       loadChildren: () => import('./features/invoice/invoice.routes')
         .then(r => r.INVOICE_ROUTES)
     }
   ];
   ```

2. **Feature Modules** (if needed)
   ```typescript
   // src/features/invoice/invoice.module.ts
   @NgModule({
     declarations: [InvoiceComponents],
     imports: [CommonModule]
   })
   export class InvoiceModule {}
   ```

3. **Barrel Exports**
   ```typescript
   // src/features/invoice/index.ts
   export * from './components/invoice-uploader/invoice-uploader.component';
   export * from './components/invoice-detail/invoice-detail.component';
   ```

---

## File Statistics

- **Total Components**: 12 (7 feature-specific, 2 shared, 3 in core)
- **Total Services**: 10 (8 in core, 1 in shared, 1 from root)
- **Models**: 2 (in core)
- **Config Files**: 1 (in core)
- **Depth**: Maximum 5 levels deep (manageable)

---

## Build Output

✅ **Build Status**: Successful  
✅ **Bundle Size**: 1.47 MB (unchanged, same optimization)  
✅ **Transfer Size**: 329.12 kB  
✅ **Compilation**: Zero errors  
✅ **All imports**: Correctly resolved
