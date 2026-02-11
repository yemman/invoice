import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-96">
    <ng-container *ngFor="let m of messageService.messages()">
      <div [ngClass]="getClasses(m.type)" class="rounded-md shadow-lg p-3 flex items-start gap-3">
        <div class="mt-0.5">
          <i [ngClass]="getIcon(m.type)" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 text-sm">
          <div class="font-medium">{{ m.type | titlecase }}</div>
          <div class="text-xs text-slate-700">{{ m.text }}</div>
        </div>
        <div class="self-start">
          <button (click)="messageService.dismiss(m.id)" class="text-slate-500 hover:text-slate-700">&times;</button>
        </div>
      </div>
    </ng-container>
  </div>
  `
})
export class MessageToastComponent {
  constructor(public messageService: MessageService) {}

  getClasses(type: string) {
    switch(type) {
      case 'success': return 'bg-emerald-50 border border-emerald-200';
      case 'error': return 'bg-rose-50 border border-rose-200';
      case 'warning': return 'bg-amber-50 border border-amber-200';
      default: return 'bg-slate-50 border border-slate-200';
    }
  }

  getIcon(type: string) {
    switch(type) {
      case 'success': return 'fa-solid fa-check text-emerald-600';
      case 'error': return 'fa-solid fa-xmark text-rose-600';
      case 'warning': return 'fa-solid fa-exclamation text-amber-600';
      default: return 'fa-solid fa-info text-slate-600';
    }
  }
}
