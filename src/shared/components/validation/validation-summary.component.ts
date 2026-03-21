
import { Component, Input, Signal } from '@angular/core';

@Component({
  selector: 'app-validation-summary',
  standalone: true,
  template: `
    @if (showSummary()) {
      <div class="bg-red-500 text-white p-4 rounded-md mb-4">
        <p>Please fix the errors before saving.</p>
      </div>
    }
  `,
})
export class ValidationSummaryComponent {
  @Input({ required: true }) showSummary!: Signal<boolean>;
}
