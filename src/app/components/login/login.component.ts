import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-white mb-2">Luddite Launcher</h1>
          <p class="text-gray-400">Sign in to access your apps</p>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8">
          <div class="flex border-b border-white/20 mb-6">
            <button
              (click)="activeTab = 'login'"
              class="pb-3 px-1 text-sm font-medium transition-colors"
              [ngClass]="activeTab === 'login' ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/70'"
            >
              Sign In
            </button>
            <button
              (click)="activeTab = 'register'"
              class="ml-8 pb-3 px-1 text-sm font-medium transition-colors"
              [ngClass]="activeTab === 'register' ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/70'"
            >
              Create Account
            </button>
          </div>

          <form *ngIf="activeTab === 'login'" (ngSubmit)="onLogin()" #loginForm="ngForm">
            <div *ngIf="errorMessage" class="mb-6 p-4 rounded-lg bg-red-500/20 text-red-200 text-sm">
              {{ errorMessage }}
            </div>

            <div class="mb-6">
              <label for="username" class="block text-sm font-medium text-white/80 mb-2">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="username"
                required
                class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your username"
              >
            </div>

            <div class="mb-6">
              <label for="password" class="block text-sm font-medium text-white/80 mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your password"
              >
            </div>

            <button
              type="submit"
              [disabled]="isLoading || !loginForm.form.valid"
              class="w-full py-3 rounded-lg bg-white/90 hover:bg-white text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-center">
                <span *ngIf="isLoading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isLoading ? 'Signing in...' : 'Sign In' }}
              </div>
            </button>
          </form>

          <form *ngIf="activeTab === 'register'" (ngSubmit)="onRegister()" #registerForm="ngForm">
            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-6 p-4 rounded-lg bg-red-500/20 text-red-200 text-sm">
              {{ errorMessage }}
            </div>

            <div *ngIf="successMessage" class="mb-6 p-4 rounded-lg bg-green-500/20 text-green-200 text-sm">
              {{ successMessage }}
            </div>

            <div class="mb-6">
              <label for="reg-username" class="block text-sm font-medium text-white/80 mb-2">Username</label>
              <input
                type="text"
                id="reg-username"
                name="reg-username"
                [(ngModel)]="registerUsername"
                required
                minlength="3"
                class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Choose a username"
              >
            </div>

            <div class="mb-6">
              <label for="reg-password" class="block text-sm font-medium text-white/80 mb-2">Password</label>
              <input
                type="password"
                id="reg-password"
                name="reg-password"
                [(ngModel)]="registerPassword"
                required
                minlength="6"
                class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Choose a password"
              >
              <p class="mt-1 text-xs text-white/60">Password must be at least 6 characters long</p>
            </div>

            <button
              type="submit"
              [disabled]="isLoading || !registerForm.form.valid"
              class="w-full py-3 rounded-lg bg-white/90 hover:bg-white text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-center">
                <span *ngIf="isLoading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  registerUsername: string = '';
  registerPassword: string = '';

  activeTab: 'login' | 'register' = 'login';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (!success) {
          this.errorMessage = 'Invalid username or password';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  onRegister() {
    if (!this.registerUsername || !this.registerPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerUsername, this.registerPassword).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.successMessage = 'Account created successfully! You can now sign in.';
          this.registerUsername = '';
          this.registerPassword = '';

          // Switch to login tab after successful registration
          setTimeout(() => {
            this.activeTab = 'login';
            this.successMessage = '';
          }, 2000);
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 409) {
          this.errorMessage = 'Username already exists. Please try another.';
        } else {
          this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
        }

        console.error('Registration error:', error);
      }
    });
  }
}
