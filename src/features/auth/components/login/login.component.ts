import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/api/auth.service';
import { MessageService } from '../../../../core/services/common/message.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg md:rounded-lg shadow-lg p-6 md:p-8">
          <!-- Header -->
          <div class="text-center mb-6 md:mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Invoice Manager</h1>
            <p class="text-sm md:text-base text-gray-600">Sign in to your account</p>
          </div>

          <!-- Tab Navigation -->
          <div class="flex gap-4 mb-6 border-b border-gray-200">
            <button
              (click)="setTab('signin')"
              [class.text-indigo-600]="tab() === 'signin'"
              [class.text-gray-500]="tab() !== 'signin'"
              [class.border-b-2]="tab() === 'signin'"
              [class.border-indigo-600]="tab() === 'signin'"
              class="pb-3 font-medium transition text-sm md:text-base"
            >
              Sign In
            </button>
            <button
              (click)="setTab('signup')"
              [class.text-indigo-600]="tab() === 'signup'"
              [class.text-gray-500]="tab() !== 'signup'"
              [class.border-b-2]="tab() === 'signup'"
              [class.border-indigo-600]="tab() === 'signup'"
              class="pb-3 font-medium transition text-sm md:text-base"
            >
              Sign Up
            </button>
          </div>

          <!-- Google Sign In -->
          <button
            (click)="signInWithGoogle()"
            [disabled]="loading()"
            class="w-full py-2.5 md:py-3 px-4 mb-6 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <svg class="w-4 md:w-5 h-4 md:h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ loading() ? 'Signing in...' : 'Sign in with Google' }}
          </button>

          <!-- Divider -->
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs md:text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <!-- Email/Password Form -->
          <form (ngSubmit)="tab() === 'signin' ? handleSignIn() : handleSignUp()" class="space-y-3 md:space-y-4">
            <!-- Name field (signup only) -->
            <div *ngIf="tab() === 'signup'">
              <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                [(ngModel)]="name"
                name="name"
                placeholder="John Doe"
                class="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                [disabled]="loading()"
              />
            </div>

            <!-- Email field -->
            <div>
              <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="you@example.com"
                class="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                [disabled]="loading()"
                required
              />
            </div>

            <!-- Password field -->
            <div>
              <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                class="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                [disabled]="loading()"
                required
              />
            </div>

            <!-- Confirm Password (signup only) -->
            <div *ngIf="tab() === 'signup'">
              <label class="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                class="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                [disabled]="loading()"
                required
              />
            </div>

            <!-- Show Password Checkbox -->
            <label class="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                (change)="showPassword.set(!showPassword())"
                class="rounded w-4 h-4"
              />
              <span class="text-xs md:text-sm text-gray-700">Show password</span>
            </label>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-2.5 md:py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm md:text-base"
            >
              {{ loading() ? 'Processing...' : (tab() === 'signin' ? 'Sign In' : 'Create Account') }}
            </button>
          </form>

          <!-- Error Message -->
          <div *ngIf="errorMessage()" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-xs md:text-sm text-red-700">{{ errorMessage() }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  // UI State
  tab = signal<'signin' | 'signup'>('signin');
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  // Form Data
  email = '';
  password = '';
  confirmPassword = '';
  name = '';

  setTab(newTab: 'signin' | 'signup') {
    this.tab.set(newTab);
    this.errorMessage.set('');
    this.resetForm();
  }

  async signInWithGoogle() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const user = await this.authService.signInWithGoogle();
      if (user) {
        this.messageService.success(`Welcome, ${user.displayName}!`);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign in with Google');
      this.messageService.error(this.errorMessage());
    } finally {
      this.loading.set(false);
    }
  }

  async handleSignIn() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const user = await this.authService.signInWithEmail(this.email, this.password);
      if (user) {
        this.messageService.success(`Welcome back, ${user.email}!`);
        this.resetForm();
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign in');
      this.messageService.error(this.errorMessage());
    } finally {
      this.loading.set(false);
    }
  }

  async handleSignUp() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const user = await this.authService.signUpWithEmail(this.email, this.password, this.name);
      if (user) {
        this.messageService.success(`Account created successfully! Welcome, ${user.email}!`);
        this.tab.set('signin');
        this.resetForm();
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to create account');
      this.messageService.error(this.errorMessage());
    } finally {
      this.loading.set(false);
    }
  }

  private resetForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.name = '';
    this.showPassword.set(false);
  }
}
