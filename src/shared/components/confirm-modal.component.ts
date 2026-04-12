import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../core/services/common/message.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div *ngIf="messageService.confirms().length > 0" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold" [class.text-red-600]="isDanger">{{ isDanger ? '⚠️ Danger Zone' : 'Confirm' }}</h3>
      </div>
      <div class="p-4 space-y-4">
        <p class="text-sm text-slate-700">{{ currentReq?.message }}</p>

        <div *ngIf="currentReq?.challengeText" class="mt-4">
          <p class="text-xs text-slate-500 mb-2">
            Please type <span class="font-bold text-slate-800 bg-slate-100 px-1 rounded">{{ currentReq?.challengeText }}</span> to confirm.
          </p>
          <input
            type="text"
            [ngModel]="challengeInput()"
            (ngModelChange)="challengeInput.set($event)"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            [placeholder]="currentReq?.challengeText"
          >
        </div>
      </div>
      <div class="p-4 border-t flex justify-end gap-2">
        <button (click)="cancel()" class="px-4 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancel</button>
        <button
          (click)="confirm()"
          [disabled]="!canConfirm"
          class="px-4 py-2 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          [ngClass]="isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
  `
})
export class ConfirmModalComponent {
  challengeInput = signal<string>('');

  constructor(public messageService: MessageService) {}

  get currentReq() {
    return this.messageService.confirms()[0];
  }

  get isDanger(): boolean {
    return this.currentReq?.type === 'danger';
  }

  get canConfirm(): boolean {
    const req = this.currentReq;
    if (!req) return false;
    if (req.challengeText) {
      return this.challengeInput() === req.challengeText;
    }
    return true;
  }

  confirm() {
    if (!this.canConfirm) return;
    const req = this.currentReq;
    if (!req) return;

    this.messageService.respondConfirm(req.id, true);
    this.resetState();
  }

  cancel() {
    const req = this.currentReq;
    if (!req) return;

    this.messageService.respondConfirm(req.id, false);
    this.resetState();
  }

  private resetState() {
    this.challengeInput.set('');
  }
}
