import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InAppBrowser, DefaultWebViewOptions } from '@capacitor/inappbrowser';
import {AppListService} from '../../services/applist.service';
import {App} from '../../models/app.interface';

interface AppWithSanitizedIcon extends App {
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
        <svg class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/70"
             viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clip-rule="evenodd"/>
        </svg>
      </div>

      @if (isFocused || searchTerm.trim()) {
        <div class="mt-2 rounded-xl bg-white/10 backdrop-blur-lg">
          @if (filteredSanitizedAppList.length > 0) {
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
  sanitizedAppList: AppWithSanitizedIcon[] = [];
  filteredSanitizedAppList: AppWithSanitizedIcon[] = [];
  isFocused = false;
  itemClicked = false;

  constructor(
    private appService: AppListService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log('SearchComponent.ngOnInit() called');

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
      },
      error: (error) => console.error('Error syncing apps with server:', error)
    });
  }

  get displayedApps() {
    return this.searchTerm.trim()
      ? this.filteredSanitizedAppList
      : this.filteredSanitizedAppList.slice(0, 4);
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

  handleBlur() {
    // Only hide the panel if we didn't click an item
    if (!this.itemClicked) {
      this.isFocused = false;
    }
    this.itemClicked = false;
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
      try {
        this.isFocused = false;
        await InAppBrowser.openInWebView({
          url: app.url,
          options: DefaultWebViewOptions
        });
      } catch (error) {
        console.error('Error opening browser:', error);
      }
    }
  }
}
