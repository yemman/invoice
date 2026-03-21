AI Behavior Rules: flatwareflow-invoice-manager
1. Angular & TypeScript Standards (v18+)
Reactive Primitive: Use Signals for all local state and UI logic. Avoid BehaviorSubject unless strictly necessary for RxJS interop.

Template Syntax: Use the Control Flow Syntax (@for, @if, @switch) exclusively. No *ngIf or *ngFor.

Component Architecture: Use Standalone Components. Ensure logic is decoupled from the UI—keep components lean by delegating complex logic to Services.

Data Handling: Access Signals by calling them as functions value(). Do not attempt to .subscribe() to a Signal.

2. Firestore & Data Verification Rules
Verification Integrity: Every invoice record must have a verificationStatus ('pending', 'verified', 'error') and a confidenceScore (from OCR).

No Blind Writes: All Firestore writes must pass through a validation service that checks for schema consistency before calling the SDK.

Read Optimization: Use limit() and startAfter() for all list views to prevent runaway document reads.

Offline First: Ensure the app handles Firestore's enableIndexedDbPersistence to maintain UI responsiveness in low-connectivity scenarios.

3. UI/UX Principles (Mobile & Desktop)
Mobile-First: Design layouts using Tailwind CSS utility classes (e.g., flex-col md:flex-row). Touch targets on mobile must be at least 44px.

Data-Heavy Views: On Desktop, use data grids with sticky headers; on Mobile, switch to card-based layouts for invoice verification.

Feedback Loops: Every OCR action or data change must trigger a non-blocking toast or a subtle loading state in the Signal.

4. Software Principles: DRY & SCUM
DRY (Don't Repeat Yourself): Create shared UI components (buttons, input fields, invoice cards) in a shared/ directory. If a logic block appears twice, move it to a utility function or service.

SCUM (Simple, Clear, Useable, Maintainable): * Simple: Favor readability over clever code.

Clear: Use descriptive variable names (e.g., isInvoiceProcessing vs loading).

Useable: UI should guide the user to the next logical "verification" step.

Maintainable: Document complex OCR regex or AI prompt logic within the code.

5. Folder Structure Organization
Follow a feature-based structure to ensure the app scales:

Plaintext
src/app/
  ├── core/             # Singleton services (Auth, Firestore config)
  ├── shared/           # Reusable UI components, pipes, directives
  ├── features/         # Domain-specific modules
  │   ├── dashboard/
  │   ├── invoice-detail/
  │   └── data-verification/ # OCR and validation logic
  ├── models/           # TypeScript Interfaces
  └── utils/            # Pure helper functions
6. Cost & Performance Optimization
Firestore Costs: Minimize document reads by using Projected Queries. Do not fetch the entire invoice body if only the total and date are needed for a list view.

AI/OCR Costs: Implement a "Debounce" on OCR triggers. Do not re-process images that haven't changed.

Bundle Size: Use Lazy Loading for all top-level routes to keep the initial JS payload small.