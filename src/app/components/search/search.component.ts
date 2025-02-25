import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebAppListService } from '../../services/webapplist.service';
import { WebApp } from '../../models/webapp.interface';
import { InAppBrowser, DefaultWebViewOptions } from '@capacitor/inappbrowser';

interface WebAppWithSanitizedIcon extends WebApp {
  safeIcon: SafeHtml;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative mx-auto max-w-2xl px-4 transform transition-all duration-300 ease-in-out"
         [ngClass]="isFocused ? 'pt-16' : 'pt-[10vh]'">
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterApps()"
          (focus)="isFocused = true"
          (blur)="handleBlur()"
          class="w-full rounded-xl bg-white/10 px-11 py-3 text-base text-white backdrop-blur-lg transition-all placeholder:text-gray-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="Search apps..."
        >
        <svg class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Results panel - shown when focused or has search term -->
      @if (isFocused || searchTerm.trim()) {
        <div class="mt-2 rounded-xl bg-white/10 backdrop-blur-lg">
          @if (filteredApps.length > 0) {
            <ul class="max-h-96 overflow-y-auto p-2 text-sm">
              @for (app of displayedApps; track app._id) {
                <li
                  (mousedown)="handleItemClick(app)"
                  class="group flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-white hover:bg-white/10"
                >
                  <div class="size-6 flex-none text-white/70" [innerHTML]="app.safeIcon"></div>
                  <span class="ml-3 flex-auto truncate">{{ app.name }}</span>
                  <span class="ml-3 flex-none text-white/70">{{ app.url }}</span>
                </li>
              }
            </ul>
          } @else {
            <div class="p-4 text-center text-white/70">
              No apps found for "{{ searchTerm }}"
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  apps: WebAppWithSanitizedIcon[] = [];
  filteredApps: WebAppWithSanitizedIcon[] = [];
  isFocused = false;
  itemClicked = false;

  constructor(
    private webAppService: WebAppListService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.webAppService.apps$.subscribe({
      next: (apps) => {
        this.apps = apps.map(app => ({
          ...app,
          safeIcon: this.sanitizer.bypassSecurityTrustHtml(app.icon)
        }));
        this.filteredApps = this.apps;
      },
      error: (error) => console.error('Error subscribing to apps:', error)
    });

    this.webAppService.syncWithServer().subscribe({
      next: () => console.log('Successfully synced with server'),
      error: (error) => console.error('Error syncing with server:', error)
    });
  }

  get displayedApps() {
    // If there's a search term, show all filtered results
    // Otherwise, show just the first 4 apps
    return this.searchTerm.trim()
      ? this.filteredApps
      : this.filteredApps.slice(0, 4);
  }

  filterApps() {
    if (!this.searchTerm.trim()) {
      this.filteredApps = this.apps;
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredApps = this.apps.filter(app =>
      app.name.toLowerCase().includes(search) ||
      app.url.toLowerCase().includes(search)
    );
  }

  handleBlur() {
    // Only hide the panel if we didn't click an item
    if (!this.itemClicked) {
      this.isFocused = false;
    }
    this.itemClicked = false;
  }

  async handleItemClick(app: WebAppWithSanitizedIcon) {
    this.itemClicked = true;
    try {
      await this.openWebApp(app);
    } catch (error) {
      console.error('Error in handleItemClick:', error);
    }
  }

  async openWebApp(webApp: WebAppWithSanitizedIcon) {
    try {
      this.isFocused = false;

      await InAppBrowser.openInWebView({
        url: webApp.url,
        options: DefaultWebViewOptions
      });
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  }
}
