import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLauncher } from '@capacitor/app-launcher';
import { NgOptimizedImage } from '@angular/common';
import { NativeAppListService } from '../../services/nativeapplist.service';
import { NativeApp } from '../../models/nativeapp.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';

interface DisplayApp {
  _id: string;
  name: string;
  url: string;
  icon: string;
  safeIcon?: SafeHtml;
  type: string;
  isPriority?: boolean;
}

@Component({
  selector: 'app-quick-access-bar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="fixed bottom-8 left-0 right-0 z-20">
      <div class="relative mx-auto max-w-2xl px-8">
        <!-- Scrollable Container -->
        <div class="overflow-x-auto scrollbar-hide py-4" #scrollContainer>
          <div class="flex justify-between w-max" style="min-width: 100%;">
            <button
              *ngFor="let app of displayApps"
              (click)="openApp(app)"
              class="size-16 flex-shrink-0 flex items-center justify-center rounded-full transition-transform active:scale-90 focus:outline-none mx-4"
              [attr.aria-label]="'Open ' + app.name"
            >
              <img
                *ngIf="isCustomIcon(app.name)"
                [ngSrc]="getCustomIconPath(app.name)"
                width="48"
                height="48"
                alt="{{app.name}}"
                class="size-12"
              />
              <div
                *ngIf="!isCustomIcon(app.name) && app.safeIcon"
                class="size-12 text-white/90 flex items-center justify-center"
                [innerHTML]="app.safeIcon">
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;  /* Chrome, Safari and Opera */
    }
  `]
})
export class QuickAccessBarComponent implements OnInit, OnDestroy {
  // The list of prioritized apps we want to show first in the quick access bar
  priorityAppNames = ['Phone', 'Messaging', 'WhatsApp', 'Camera'];
  displayApps: DisplayApp[] = [];
  // Removed scroll controls

  scrollContainer: HTMLElement | null = null;

  constructor(
    private nativeAppService: NativeAppListService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNativeApps();

    // Subscribe to route changes to reset scroll position
    this.resetScrollOnNavigation();
  }

  ngAfterViewInit() {
    this.scrollContainer = document.querySelector('.scrollbar-hide');
    this.resetScrollPosition();
  }

  resetScrollOnNavigation() {
    // Listen for router navigation events
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.resetScrollPosition();
      }
    });

    // Also check for browser navigation events
    window.addEventListener('popstate', this.resetScrollPosition.bind(this));
  }

  // Reset scroll position when app is inactive and becomes active again
  @HostListener('window:focus')
  onWindowFocus() {
    this.resetScrollPosition();
  }

  resetScrollPosition() {
    if (this.scrollContainer) {
      setTimeout(() => {
        if (this.scrollContainer) {
          this.scrollContainer.scrollLeft = 0;
        }
      }, 100);
    }
  }

  loadNativeApps() {
    this.nativeAppService.apps$.subscribe({
      next: (apps) => {
        // First, prioritize the target apps
        const priorityApps = apps
          .filter(app => this.isPriorityApp(app.name))
          .map(app => this.convertToDisplayApp(app, true))
          .sort((a, b) => {
            // Sort by the order in priorityAppNames
            return this.priorityAppNames.indexOf(a.name) - this.priorityAppNames.indexOf(b.name);
          });

        // Then add the rest of the apps, alphabetically
        const otherApps = apps
          .filter(app => !this.isPriorityApp(app.name))
          .map(app => this.convertToDisplayApp(app, false))
          .sort((a, b) => a.name.localeCompare(b.name));

        // Combine the two lists
        this.displayApps = [...priorityApps, ...otherApps];

        // Reset scroll position after data loaded
        setTimeout(() => this.resetScrollPosition(), 100);
      },
      error: (error) => console.error('Error loading native apps:', error)
    });

    // Also trigger a sync with server to ensure we have the latest data
    this.nativeAppService.syncWithServer().subscribe();
  }

  isPriorityApp(name: string): boolean {
    return this.priorityAppNames.some(targetName =>
      name.toLowerCase().includes(targetName.toLowerCase())
    );
  }

  convertToDisplayApp(app: NativeApp, isPriority = false): DisplayApp {
    return {
      _id: app._id,
      name: app.name,
      url: app.uri,
      icon: app.icon,
      safeIcon: this.sanitizer.bypassSecurityTrustHtml(app.icon),
      type: 'nativeApp',
      isPriority
    };
  }

  isCustomIcon(name: string): boolean {
    // Return true for apps where we want to use our custom icons
    return ['Phone', 'Messaging', 'WhatsApp', 'Camera','Proton Calendar','Proton Mail','Proton Pass','Proton Wallet','Proton Drive','LudditeInstaller'].includes(name);
  }

  getCustomIconPath(name: string): string {
    const iconMap: Record<string, string> = {
      'Phone': '/assets/images/icons8Phone.png',
      'Messaging': '/assets/images/icons8Messages.png',
      'WhatsApp': '/assets/images/icons8Whatsapp.png',
      'Camera': '/assets/images/icons8Camera.png',
      'Proton Calendar': '/assets/images/protoncalendar.svg',
      'Proton Mail': '/assets/images/protonmail.svg',
      'Proton Pass': '/assets/images/protonpass.svg',
      'Proton Wallet': '/assets/images/protonwallet.svg',
      'Proton Drive': '/assets/images/protondrive.svg',
      'LudditeInstaller': '/assets/images/icons8Installer.png',
    };

    return iconMap[name] || '';
  }

  async openApp(app: DisplayApp) {
    try {
      AppLauncher.openUrl({ url: app.url })
        .then(() => {
          console.log(`Successfully opened ${app.name}`);
        })
        .catch((error) => {
          console.error(`Error opening ${app.name}:`, error);
        });
    } catch (error) {
      console.error(`Error calling openUrl for ${app.name}:`, error);
    }
  }

  ngOnDestroy() {
    // Clean up event listeners
    window.removeEventListener('popstate', this.resetScrollPosition);
  }
}
