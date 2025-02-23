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
    <div class="relative z-10" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500/25 transition-opacity" aria-hidden="true"></div>
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <div class="mx-auto max-w-2xl transform divide-y divide-gray-500/10 overflow-hidden rounded-xl bg-white/80 shadow-2xl ring-1 ring-black/5 backdrop-blur backdrop-filter transition-all">
          <div class="grid grid-cols-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="filterApps()"
              class="col-start-1 row-start-1 h-12 w-full bg-transparent pl-11 pr-4 text-base text-gray-900 outline-none placeholder:text-gray-500 sm:text-sm"
              placeholder="Search apps..."
            >
            <svg class="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-900/40" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
            </svg>
          </div>

          @if (filteredApps.length > 0) {
            <ul class="max-h-96 overflow-y-auto p-2 text-sm text-gray-700">
              @for (app of filteredApps; track app._id) {
                <li class="group flex cursor-pointer select-none items-center rounded-md px-3 py-2 hover:bg-gray-900/5">
                  <div class="size-6 flex-none text-gray-900/40" [innerHTML]="app.icon"></div>
                  <span class="ml-3 flex-auto truncate">{{ app.name }}</span>
                  <span class="ml-3 flex-none text-gray-500">{{ app.url }}</span>
                </li>
              }
            </ul>
          } @else {
            <div class="px-6 py-14 text-center sm:px-14">
              <svg class="mx-auto size-6 text-gray-900/40" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              <p class="mt-4 text-sm text-gray-900">No apps found. Try a different search term.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  apps: WebApp[] = [];
  filteredApps: WebApp[] = [];

  constructor(private webAppService: WebAppListService) {}

  ngOnInit() {
    // Subscribe to the apps$ observable from the service
    this.webAppService.apps$.subscribe(apps => {
      this.apps = apps;
      this.filteredApps = apps;
    });

    // Initial sync with server
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
