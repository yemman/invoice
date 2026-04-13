<div align="center">

# FlatwareFlow Invoice Manager

**An automated CRM and invoice processing system leveraging AI-powered OCR to streamline operations and inventory tracking for disposable flatware sellers.**

[![CI Status](https://github.com/flatwareflow/flatwareflow-invoice-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/flatwareflow/flatwareflow-invoice-manager/actions)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031.svg?style=flat&logo=angular&logoColor=white)](https://angular.io)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg?style=flat&logo=firebase&logoColor=white)](https://firebase.google.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## ✨ Features

- **AI-Powered OCR**: Utilizes Google Gemini Flash for automatic, intelligent text extraction from invoice images and smart data verification.
- **Real-time Lead & Inventory Tracking**: Instant synchronization and cache management of catalog data using Firestore real-time subscriptions.
- **Advanced Dashboard Analytics**: Comprehensive overview of sales, inventory, and receivables with interactive, drill-down capabilities.
- **Robust Search & Filtering**: Multi-criteria system supporting full-text search, custom date ranges, and advanced amount-based boundaries.
- **Export Capabilities**: Seamlessly export full dataset reports to CSV for external tools ("Snapshot for the eyes, Full Data for the tools").

## 🏗️ Architecture

The system is built on a highly optimized, modern frontend stack designed for performance and maintainability:

- **Framework**: Angular 21 utilizing the Vite-based `@angular/build:application` builder.
- **Reactivity & State**: Deep integration with Angular Signals, leveraging `provideZonelessChangeDetection()` for highly efficient, zoneless change detection.
- **Component Pattern**: 100% Single Component Angular Modules (SCAM) providing self-contained, tree-shakeable components.
- **Data Layer**: Direct integration with Firebase/Firestore. Local caching of data via `onSnapshot` combined with signals provides instant $O(1)$ client-side filtering without extra database reads.
- **Styling**: Tailwind CSS 4.x for mobile-first, utility-driven responsive design.

## 🚀 DevOps

The project utilizes GitHub Actions for continuous integration, enforcing strict quality and testing standards:

- **Node & Java Environment**: The pipeline targets Node 24 and Java 21 (Temurin) to support standard building alongside the Firebase Emulator suite.
- **Strict Dependency Management**: Utilizing `npm ci` with explicit `actions/cache` steps and lockfile integrity checks (`npm run lock-check`).
- **Hermetic Testing**: Unit and integration tests run via Vitest natively. Firestore tests execute hermetically against the Firebase Emulator in a "demo-mode" project (`demo-crm-test`), avoiding any mutations to real GCP environments.
- **Build Verification**: Ensures the application successfully builds production artifacts via standard `npm run build` using the Vite builder.

## 💻 Setup

Follow these steps to set up the development environment locally. Note that the local Angular development server runs on port `3000`.

### Prerequisites

- Node.js (v20+ recommended)
- Firebase CLI installed globally
- Java (JDK 21+) for running the Firebase Emulator

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flatwareflow-invoice-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create the necessary development environment file by copying the base configuration:
     ```bash
     cp environments/environment.ts environments/environment.development.ts
     ```
   - Set up the Gemini API key. Create a `.env.local` file in the root directory:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   *The application will be accessible at [http://localhost:3000](http://localhost:3000).*

5. **Run Tests**
   ```bash
   # Run unit tests via Vitest
   npm run test
   ```

## 📬 Contact

For business inquiries, support requests, or further information regarding this system, please reach out:

**For inquiries, please contact [yannayhi@gmail.com](mailto:yannayhi@gmail.com)**

---
*Built with precision for seamless flatware management.*
