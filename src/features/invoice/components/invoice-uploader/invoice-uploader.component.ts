import { Component, output, signal, ChangeDetectionStrategy, inject, EventEmitter, Output } from '@angular/core';
import { MessageService } from '../../../../core/services/common/message.service';


@Component({
    selector: 'app-invoice-uploader',
    standalone: true,
    imports: [],
    templateUrl: './invoice-uploader.component.html',
    styleUrl: './invoice-uploader.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceUploaderComponent {
  @Output() newInvoice = new EventEmitter<void>();
  imageSelected = output<string>(); // Emits base64 string
  manualEntry = output<void>(); // trigger manual invoice creation

  isProcessing = signal(false);
  previewUrl = signal<string | null>(null);
  private messageService = inject(MessageService);
  
  // Internal base64 store without prefix for processing
  private rawBase64: string | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  private readFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.messageService.warn('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.previewUrl.set(result);
      // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
      this.rawBase64 = result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  processImage() {
    if (this.rawBase64) {
      this.isProcessing.set(true);
      this.imageSelected.emit(this.rawBase64);
    }
  }

  reset() {
    this.isProcessing.set(false);
    this.previewUrl.set(null);
    this.rawBase64 = null;
  }
}