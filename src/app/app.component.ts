import { Component, inject, signal, ChangeDetectionStrategy, ViewEncapsulation, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../core/services/data/invoice.service';
import { MessageToastComponent } from '../shared/components/message-toast.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal.component';
import { MessageService } from '../core/services/common/message.service';
import { AuthService } from '../core/services/api/auth.service';
import { Invoice } from '../core/models/invoice.model';
import { InvoiceUploaderComponent } from '../features/invoice/components/invoice-uploader/invoice-uploader.component';
import { DataVerificationComponent } from '../features/invoice/components/data-verification/data-verification.component';
import { DashboardComponent } from '../features/dashboard/components/dashboard/dashboard.component';
import { LoginComponent } from '../features/auth/components/login/login.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, InvoiceUploaderComponent, DataVerificationComponent, DashboardComponent, MessageToastComponent, ConfirmModalComponent, LoginComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);
  protected authService = inject(AuthService);

  // Simple state machine for the view
  view = signal<'dashboard' | 'upload' | 'verify'>('dashboard');
  
  // Mobile sidebar state
  sidebarOpen = signal(false);
  
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
      this.messageService.error('Failed to analyze invoice. Please try again or check your API key.');
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

  async handleSignOut() {
    try {
      await this.authService.signOut();
      this.messageService.success('Signed out successfully');
    } catch (error: any) {
      this.messageService.error(error.message || 'Failed to sign out');
    }
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}