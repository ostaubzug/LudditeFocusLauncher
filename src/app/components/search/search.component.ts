import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InAppBrowser, DefaultWebViewOptions } from '@capacitor/inappbrowser';
import { AppListService } from '../../services/applist.service';
import { App } from '../../models/app.interface';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {AppLauncher} from '@capacitor/app-launcher';

interface AppWithSanitizedIcon extends App {
  safeIcon: SafeHtml;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('200ms ease-in')
      ])
    ])
  ],
  template: `
    <div class="relative mx-auto max-w-2xl px-4 transform transition-all duration-300 ease-in-out"
         [ngClass]="isFocused ? 'pt-16' : 'pt-[10vh]'">
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterApps()"
          (focus)="onFocus()"
          (blur)="handleBlur()"
          class="w-full rounded-xl bg-white/10 px-11 py-3 text-base text-white backdrop-blur-lg transition-all placeholder:text-gray-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="Search apps..."
        >
        <svg class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/70"
             viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clip-rule="evenodd"/>
        </svg>
      </div>

      @if (isFocused || searchTerm.trim()) {
        <div
          [@fadeAnimation]="showResults ? 'visible' : 'hidden'"
          class="mt-8 rounded-xl bg-white/10 backdrop-blur-lg">
          @if (filteredSanitizedAppList.length > 0) {
            <ul class="max-h-72 overflow-y-auto p-2 text-sm custom-scrollbar">
              @for (app of filteredSanitizedAppList; track app._id) {
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
  `,
  styles: [`
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      display: block;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  sanitizedAppList: AppWithSanitizedIcon[] = [];
  filteredSanitizedAppList: AppWithSanitizedIcon[] = [];
  isFocused = false;
  itemClicked = false;
  showResults = false; // Control visibility separately for animation

  constructor(
    private appService: AppListService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log('SearchComponent.ngOnInit() called');
    // Initialize showResults to true if there's a search term
    this.showResults = this.searchTerm.trim().length > 0;

    this.appService.apps$.subscribe({
      next: (appList) => {
        this.sanitizedAppList = appList.map(app => ({
          ...app,
          safeIcon: this.sanitizer.bypassSecurityTrustHtml(app.icon)
        }));
        this.filteredSanitizedAppList = this.sanitizedAppList;
      },
      error: (error) => console.error('Error subscribing to Apps:', error)
    });

    this.appService.syncAll().subscribe({
      next: (apps) => {
        console.log('Successfully synced apps with server');
      },
      error: (error) => console.error('Error syncing apps with server:', error)
    });
  }

  // Handle focus event on the search input
  onFocus() {
    this.isFocused = true;
    // Ensure any previous animation completes
    setTimeout(() => {
      this.showResults = true;
    }, 10);
  }

  // Handle blur event on the search input
  handleBlur() {
    // Only hide the panel if we didn't click an item
    if (!this.itemClicked) {
      this.isFocused = false;
      this.showResults = false;
    }
    this.itemClicked = false;
  }

  // This method is no longer used since we're showing all items in the scrollable list
  get displayedApps() {
    return this.filteredSanitizedAppList;
  }

  filterApps() {
    if (!this.searchTerm.trim()) {
      this.filteredSanitizedAppList = this.sanitizedAppList;
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredSanitizedAppList = this.sanitizedAppList.filter(app =>
      app.name.toLowerCase().includes(search) ||
      app.url.toLowerCase().includes(search)
    );
  }

  async handleItemClick(app: AppWithSanitizedIcon) {
    this.itemClicked = true;
    try {
      await this.openApp(app);
    } catch (error) {
      console.error('Error in handleItemClick:', error);
    }
  }

  async openApp(app: AppWithSanitizedIcon) {
    if(app.type == "webApp"){
      this.isFocused = false;
      this.showResults = false;
      try {
        await InAppBrowser.openInWebView({
          url: app.url,
          options: DefaultWebViewOptions
        });
      } catch (error) {
        console.error('Error opening webView:', error);
      }
    }
    if(app.type == "nativeApp"){
      try {
        AppLauncher.openUrl({url: app.url})
          .then(() => {})
      } catch (error) {
        console.error('Error calling openUrl:', error);
      }
    }
  }
}
