import { Injectable, signal } from '@angular/core';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  timeout?: number; // ms
}

export interface ConfirmRequestView {
  id: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messagesSignal = signal<Message[]>([]);
  private confirmSignal = signal<ConfirmRequestView[]>([]);
  private confirmResolvers = new Map<string, (value: boolean) => void>();

  readonly messages = this.messagesSignal.asReadonly();
  readonly confirms = this.confirmSignal.asReadonly();

  private genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  show(text: string, type: MessageType = 'info', timeout = 5000) {
    const msg: Message = { id: this.genId(), text, type, timeout };
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
  async confirm(message: string): Promise<boolean> {
    const id = this.genId();
    return new Promise<boolean>((resolve) => {
      this.confirmResolvers.set(id, resolve);
      this.confirmSignal.update(arr => [...arr, { id, message }]);
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
