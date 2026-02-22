import { Injectable, signal } from '@angular/core';

@Injectable()
export class ExpandableCardService {
  private expandedState = signal(false);
  readonly expanded = this.expandedState.asReadonly();

  toggleExpand(): void {
    this.expandedState.update(value => !value);
    this.updateBodyScroll(!this.expandedState());
  }

  private updateBodyScroll(shouldHide: boolean): void {
    if (shouldHide) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  reset(): void {
    this.expandedState.set(false);
    this.updateBodyScroll(false);
  }
}
