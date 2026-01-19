import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative min-h-[300px]"
           (dragover)="onDragOver($event)"
           (drop)="onDrop($event)">
        
        <input type="file" 
               accept="image/*" 
               class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               (change)="onFileSelected($event)">

        @if (!previewUrl()) {
          <div class="text-center pointer-events-none">
            <div class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-700">Upload Invoice</h3>
            <p class="text-slate-500 mt-2">Drag & drop or click to select</p>
            <p class="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
          </div>
        } @else {
          <div class="relative w-full h-full flex items-center justify-center bg-slate-900/5 rounded-lg overflow-hidden">
             <img [src]="previewUrl()" class="max-h-[280px] object-contain shadow-sm" alt="Invoice Preview">
             <div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <span class="text-white font-medium bg-black/50 px-3 py-1 rounded-full">Change Image</span>
             </div>
          </div>
        }
      </div>

      @if (previewUrl()) {
        <button (click)="processImage()" 
                [disabled]="isProcessing()"
                class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
          @if (isProcessing()) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing with Gemini...
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            Extract Data
          }
        </button>
      }
    </div>
  `
})
export class InvoiceUploaderComponent {
  imageSelected = output<string>(); // Emits base64 string
  isProcessing = signal(false);
  previewUrl = signal<string | null>(null);
  
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
      alert('Please upload an image file.');
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