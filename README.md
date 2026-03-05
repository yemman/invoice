# FlatwareFlow Invoice Manager

An automated invoice processing system designed specifically for disposable flatware sellers. This Angular application leverages AI-powered OCR using Google Gemini Flash for intelligent data extraction, combined with comprehensive inventory tracking and accounts receivable management.

## ✨ Features

### 🤖 AI-Powered Processing
- **OCR Integration**: Google Gemini Flash for automatic text extraction from invoice images
- **Smart Data Verification**: AI-assisted validation of extracted invoice data
- **Intelligent Categorization**: Automatic classification of flatware items and quantities

### 📊 Advanced Analytics
- **Real-time Dashboard**: Comprehensive overview of sales, inventory, and receivables
- **Advanced Filtering**: Multi-criteria search and filtering system
- **Financial Insights**: Revenue tracking, customer analytics, and inventory sold metrics

### 🔍 Search & Filtering
- **Full-text Search**: Search across invoice numbers, customer names, and item descriptions
- **Date Range Filtering**: Filter invoices by custom date ranges
- **Status Management**: Track verified vs. draft invoices
- **Amount-based Filtering**: Min/max amount boundaries
- **Customer-specific Views**: Filter by individual customers

### 🏗️ Modern Architecture
- **SCAM Pattern**: 100% standalone components (Single Component Angular Modules)
- **Firebase Integration**: Real-time database and authentication
- **Responsive Design**: TailwindCSS for mobile-first UI
- **Type-Safe**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Angular 21 (Standalone Components)
- **Styling**: TailwindCSS 4.x
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI/ML**: Google Gemini Flash API
- **Build Tool**: Vite
- **Deployment**: Docker + Nginx
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Google Cloud Project with Gemini API enabled
- Firebase project configured

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flatwareflow-invoice-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - The Firebase configuration is pre-configured in `src/core/config/firebase.config.ts`
   - Ensure your Firebase project has Firestore and Authentication enabled

4. **Set up Google Gemini API**
   - Obtain a Gemini API key from Google AI Studio
   - Create a `.env.local` file in the root directory:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:4200](http://localhost:4200) in your browser

### 🐳 Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t flatwareflow-invoice-manager .
   ```

2. **Run the container**
   ```bash
   docker run -p 80:80 flatwareflow-invoice-manager
   ```

3. **Access the application**
   - Open [http://localhost](http://localhost) in your browser

## 📁 Project Structure

```
src/
├── app/                          # Root application component
├── core/                         # Core business logic
│   ├── config/                   # Firebase configuration
│   ├── models/                   # TypeScript interfaces
│   ├── services/                 # Business logic services
│   │   ├── api/                  # External API services
│   │   ├── common/               # Shared utilities
│   │   ├── constants/            # App constants
│   │   └── data/                 # Data management services
├── features/                     # Feature modules
│   ├── auth/                     # Authentication
│   ├── catalog/                  # Product catalog management
│   ├── dashboard/                # Main dashboard
│   └── invoice/                  # Invoice processing
└── shared/                       # Shared components & utilities
    ├── components/               # Reusable UI components
    ├── services/                 # Shared services
    └── utils/                    # Utility functions
```

## 🏃 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm run test` - Run unit tests

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:
```
GEMINI_API_KEY=your_gemini_api_key
```

### Firebase Setup
The application uses Firebase for:
- **Authentication**: User login/management
- **Firestore**: Invoice and catalog data storage
- **Storage**: File uploads (invoice images)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is public.

## 🆘 Support

For support or questions, please contact the development team.
Under yannayhi@gmail.com
