import { Injectable, signal, inject } from '@angular/core';
import { CalculationUtilityService } from './calculation-utility.service';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  timeout?: number; // ms
}

export type ConfirmModalType = 'standard' | 'danger';

export interface ConfirmRequestView {
  id: string;
  message: string;
  type: ConfirmModalType;
  challengeText?: string;
}

export interface ConfirmConfig {
  type?: ConfirmModalType;
  challengeText?: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private calculation = inject(CalculationUtilityService);
  private messagesSignal = signal<Message[]>([]);
  private confirmSignal = signal<ConfirmRequestView[]>([]);
  private confirmResolvers = new Map<string, (value: boolean) => void>();

  readonly messages = this.messagesSignal.asReadonly();
  readonly confirms = this.confirmSignal.asReadonly();

  show(text: string, type: MessageType = 'info', timeout = 5000) {
    const msg: Message = { id: this.calculation.generateId(), text, type, timeout };
    this.messagesSignal.update(arr => [...arr, msg]);
    if (timeout && timeout > 0) {
      setTimeout(() => this.dismiss(msg.id), timeout);
    }
    return msg.id;
  }

  success(text: string, timeout = 4000) { return this.show(text, 'success', timeout); }
  error(text: string, timeout = 7000) { return this.show(text, 'error', timeout); }
  info(text: string, timeout = 5000) { return this.show(text, 'info', timeout); }
  warn(text: string, timeout = 6000) { return this.show(text, 'warning', timeout); }

  dismiss(id: string) {
    this.messagesSignal.set(this.messagesSignal().filter(m => m.id !== id));
  }

  // Simple confirm wrapper for now; can be replaced with a modal implementation later
  async confirm(message: string, config?: ConfirmConfig): Promise<boolean> {
    const id = this.calculation.generateId();
    const type = config?.type || 'standard';
    const challengeText = config?.challengeText;

    return new Promise<boolean>((resolve) => {
      this.confirmResolvers.set(id, resolve);
      this.confirmSignal.update(arr => [...arr, { id, message, type, challengeText }]);
    });
  }

  // Called by UI modal to resolve a pending confirm request
  respondConfirm(id: string, result: boolean) {
    const resolver = this.confirmResolvers.get(id);
    if (resolver) {
      resolver(result);
      this.confirmResolvers.delete(id);
    }
    // remove from queue
    this.confirmSignal.set(this.confirmSignal().filter(c => c.id !== id));
  }
}
