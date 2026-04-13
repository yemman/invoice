# FlatwareFlow: Technical Debt & Audit Report

This report summarizes the gaps identified during the production-grade architecture audit. Inline comments (`// TODO (Jules): ...`) have been added to the specific files where these issues reside.

## 1. Angular 21 Efficiency
The application currently uses signals and `provideZonelessChangeDetection()`, but can be further optimized.

*   **Lazy Loading (`@defer`):** Main views and heavy sub-components (like `app-catalog-management` and `app-customer-invoices`) are loaded eagerly. They should be wrapped in `@defer` blocks to reduce the initial bundle size and speed up first-contentful paint. *(Found in `app.component.html`, `dashboard.component.html`, `catalog-management.component.html`)*
*   **Signal Conversion:** Several traditional `@Input()` decorators exist and should be migrated to signal inputs (`input()`, `input.required()`). Some methods (like getters) should be converted to `computed()` signals to prevent unnecessary re-evaluations during template rendering. *(Found in various presentational components like `customer-invoices.component.ts`, `app.component.ts`)*

## 2. Firestore Performance
Data access patterns currently rely heavily on fetching full collections, which is acceptable for small datasets but will fail at scale.

*   **Memory Management:** Components subscribing via `subscribeToCollection` must properly unsubscribe when destroyed to prevent memory leaks and unnecessary background reads. *(Found in `base-firebase.service.ts`)*
*   **Offline Capabilities:** The `subscribeToCollection` and specifically `subscribeToInvoices` lacks robust error handling for disconnected states. We should implement Firestore offline persistence. *(Found in `firebase.service.ts`, `catalog.service.ts`)*
*   **Missing Indexes:** We lack a mechanism to explicitly pass or define composite indexes when querying multiple fields or using `orderBy` with `where`. *(Found in `base-firebase.service.ts`)*
*   **Pagination & N+1 Problems:** The system currently fetches all invoices at once. A `limit()` or pagination strategy is required. Furthermore, mapping over raw data and performing memory lookups (`getCatalogItemByIndex`) per item creates an O(N) lookup that could become an N+1 problem if it eventually hits the DB instead of memory. *(Found in `invoice.service.ts`)*

## 3. Security & Validation
There are critical security holes regarding data ownership and information leakage.

*   **Firestore Rules (CRITICAL):** The `firestore.rules` file is completely open (`allow read, write: if true;`). This must be locked down immediately to verify authentication state (`request.auth != null`) and ensure users can only access their own CRM data. *(Found in `firestore.rules`)*
*   **Information Leakage:** Environment variables (like `API_KEY`) and sensitive error stack traces are being logged directly to `console.log` and `console.error`. These must be removed or routed through a sanitized `ErrorHandlerService`. *(Found in `invoice.service.ts`, `catalog-management.component.ts`, `app.component.ts`)*
*   **Input Sanitization:** User inputs (like catalog item names) are not sanitized before being saved to Firestore, posing a potential XSS risk if the data is ever rendered outside of Angular's strict context. *(Found in `catalog-management.component.ts`)*

## 4. Scalability
As the application grows, certain client-side operations will become bottlenecks.

*   **Heavy Client-Side Logic:** Features like CSV export (`exportToCsv`) and complex multi-field filtering (`filteredInvoices`) are processed entirely in the browser. For datasets exceeding ~10,000 records, this will block the main thread. These operations should be delegated to a Cloud Run backend, Web Worker, or a dedicated search service (like Algolia/Typesense). *(Found in `export.utils.ts`, `invoice-filter.service.ts`, `dashboard.component.ts`)*
*   **Hardcoded Limits:** Magic numbers, such as the Firestore batch deletion limit (`500`), are hardcoded in the service layer. These should be extracted to `AppConstantsService` or environment variables for easier tuning. *(Found in `base-firebase.service.ts`)*

---
*Audit completed by Jules. Prioritize security rules and lazy loading for the next sprint.*
