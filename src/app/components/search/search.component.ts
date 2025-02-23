import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebAppListService } from '../../services/webapplist.service';
import { WebApp } from '../../models/webapp.interface';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative mx-auto max-w-2xl px-4 pt-16">
      <!-- Search input with glass effect -->
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterApps()"
          class="w-full rounded-xl bg-white/10 px-11 py-3 text-base text-white backdrop-blur-lg transition-all placeholder:text-gray-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="Search apps..."
        >
        <svg class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Results panel - only shown when there's a search term -->
      @if (searchTerm.trim()) {
        <div class="mt-2 rounded-xl bg-white/10 backdrop-blur-lg">
          @if (filteredApps.length > 0) {
            <ul class="max-h-96 overflow-y-auto p-2 text-sm">
              @for (app of filteredApps; track app._id) {
                <li class="group flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-white hover:bg-white/10">
                  <div class="size-6 flex-none text-white/70" [innerHTML]="app.icon"></div>
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
  apps: WebApp[] = [];
  filteredApps: WebApp[] = [];

  constructor(private webAppService: WebAppListService) {}

  ngOnInit() {
    this.webAppService.apps$.subscribe(apps => {
      this.apps = apps;
      this.filteredApps = apps;
    });
    this.webAppService.syncWithServer().subscribe();
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
}
