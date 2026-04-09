
import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  template: `
    @if (control()?.touched && control()?.invalid) {
      <div class="text-red-500 text-xs mt-1">
        Required field
      </div>
    }
  `,
})
export class ValidationMessageComponent {
  control = input.required<FormControl>();
}
