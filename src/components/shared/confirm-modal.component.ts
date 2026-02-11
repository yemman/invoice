import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div *ngIf="messageService.confirms().length > 0" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Confirm</h3>
      </div>
      <div class="p-4">
        <p class="text-sm text-slate-700">{{ (messageService.confirms()[0])?.message }}</p>
      </div>
      <div class="p-4 border-t flex justify-end gap-2">
        <button (click)="cancel()" class="px-4 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</button>
        <button (click)="confirm()" class="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700">Delete</button>
      </div>
    </div>
  </div>
  `
})
export class ConfirmModalComponent {
  constructor(public messageService: MessageService) {}

  private get current() {
    return this.messageService.confirms()[0];
  }

  confirm() {
    const req = this.current;
    if (!req) return;
    this.messageService.respondConfirm(req.id, true);
  }

  cancel() {
    const req = this.current;
    if (!req) return;
    this.messageService.respondConfirm(req.id, false);
  }
}
