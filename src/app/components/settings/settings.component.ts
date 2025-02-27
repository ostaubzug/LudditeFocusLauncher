import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CapacitorHttp } from '@capacitor/core';
import { Router } from '@angular/router';
import { AppListService } from '../../services/applist.service';

interface WishlistItem {
  name: string;
  url: string;
  comment: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white p-6">
      <!-- Header -->
      <div class="max-w-md mx-auto mb-8 pt-6">
        <div class="flex items-center mb-6">
          <button
            (click)="goBack()"
            class="p-2 mr-4 rounded-full text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-900">Luddite Settings</h1>
        </div>
      </div>

      <!-- Sync Button Section -->
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900">Sync App Data</h2>
        <p class="text-sm text-gray-600 mb-4">
          Sync all application data with the server to get the latest available apps and updates.
        </p>

        <button
          (click)="syncAllData()"
          class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          [disabled]="isSyncing"
        >
          <span *ngIf="isSyncing" class="mr-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
        </button>

        <!-- Success Message -->
        <div *ngIf="syncSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-green-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>App data successfully synced!</p>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="syncError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-red-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p>{{ syncErrorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Wishlist Form -->
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold mb-6 text-gray-900">Submit Website Suggestion</h2>
        <form (ngSubmit)="submitWishlistItem()">
          <div class="mb-5">
            <label for="name" class="block mb-2 text-sm font-medium text-gray-700">Website Name</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="wishlistItem.name"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter website name"
            >
          </div>

          <div class="mb-5">
            <label for="url" class="block mb-2 text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              id="url"
              name="url"
              [(ngModel)]="wishlistItem.url"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            >
          </div>

          <div class="mb-5">
            <label for="comment" class="block mb-2 text-sm font-medium text-gray-700">Comment (Optional)</label>
            <textarea
              id="comment"
              name="comment"
              [(ngModel)]="wishlistItem.comment"
              rows="3"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Why do you want this website to be added?"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            [disabled]="isSubmitting"
          >
            <div class="flex items-center justify-center">
              <span *ngIf="isSubmitting" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isSubmitting ? 'Submitting...' : 'Submit Suggestion' }}
            </div>
          </button>
        </form>

        <!-- Success Message -->
        <div *ngIf="submitSuccess" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-green-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Your suggestion was submitted successfully!</p>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="submitError" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-red-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  wishlistItem: WishlistItem = {
    name: '',
    url: '',
    comment: ''
  };

  // For wishlist submission
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  // For sync functionality
  isSyncing = false;
  syncSuccess = false;
  syncError = false;
  syncErrorMessage = '';

  constructor(
    private router: Router,
    private appListService: AppListService
  ) {}

  goBack() {
    this.router.navigate(['']);
  }

  async submitWishlistItem() {
    if (!this.wishlistItem.name || !this.wishlistItem.url) {
      this.submitError = true;
      this.errorMessage = 'Please provide both a name and URL.';
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const response = await CapacitorHttp.post({
        url: 'http://195.15.192.3:3000/api/wishlist',
        headers: {
          'Content-Type': 'application/json'
        },
        data: this.wishlistItem
      });

      if (response.status === 201) {
        this.submitSuccess = true;
        this.wishlistItem = {
          name: '',
          url: '',
          comment: ''
        };
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting wishlist item:', error);
      this.submitError = true;
      this.errorMessage = 'Failed to submit suggestion. Please try again later.';
    } finally {
      this.isSubmitting = false;
    }
  }

  syncAllData() {
    this.isSyncing = true;
    this.syncSuccess = false;
    this.syncError = false;

    this.appListService.syncAll().subscribe({
      next: (apps) => {
        console.log('Successfully synced all app data:', apps.length, 'apps found');
        this.syncSuccess = true;
        this.isSyncing = false;

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.syncSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error syncing app data:', error);
        this.syncError = true;
        this.syncErrorMessage = 'Failed to sync app data. Please check your connection and try again.';
        this.isSyncing = false;
      }
    });
  }
}
