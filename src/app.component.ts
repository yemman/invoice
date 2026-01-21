import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from './services/invoice.service';
import { Invoice } from './models/invoice.model';
import { InvoiceUploaderComponent } from './components/invoice-uploader.component';
import { DataVerificationComponent } from './components/data-verification.component';
import { DashboardComponent } from './components/dashboard.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, InvoiceUploaderComponent, DataVerificationComponent, DashboardComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private invoiceService = inject(InvoiceService);

  // Simple state machine for the view
  view = signal<'dashboard' | 'upload' | 'verify'>('dashboard');
  
  // Temporary holding for data being processed
  currentExtractedData = signal<Partial<Invoice> | null>(null);

  get stats() {
    return {
      totalRevenue: this.invoiceService.totalRevenue(),
      invoiceCount: this.invoiceService.invoices().length
    };
  }

  // --- Handlers ---

  async handleImageSelected(base64: string) {
    try {
      const extracted = await this.invoiceService.analyzeInvoiceImage(base64);
      this.currentExtractedData.set(extracted);
      this.view.set('verify');
    } catch (err) {
      console.error(err);
      alert('Failed to analyze invoice. Please try again or check your API key.');
    }
  }

  handleVerificationConfirm(data: Partial<Invoice>) {
    this.invoiceService.addInvoice(data);
    this.currentExtractedData.set(null);
    this.view.set('dashboard');
  }

  handleVerificationCancel() {
    this.currentExtractedData.set(null);
    this.view.set('upload');
  }

  navigateToUpload() {
    this.view.set('upload');
  }

  navigateToDashboard() {
    this.view.set('dashboard');
  }
}