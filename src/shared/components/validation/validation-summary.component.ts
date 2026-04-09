
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-validation-summary',
  standalone: true,
  template: `
    @if (errors().length > 0) {
      <div class="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg mb-6 shadow-sm animate-fadeIn">
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-circle-exclamation mt-1 text-red-500"></i>
          <div>
            <h3 class="font-bold text-sm mb-1 text-red-800">Please fix the following issues to continue:</h3>
            <ul class="list-disc pl-5 text-sm space-y-1 mt-2">
              @for (error of errors(); track error) {
                <li class="pl-1">{{ error }}</li>
              }
            </ul>
          </div>
        </div>
      </div>
    }
  `,
})
export class ValidationSummaryComponent {
  errors = input<string[]>([]);
}
