import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLauncher } from '@capacitor/app-launcher';
import { NgOptimizedImage } from '@angular/common';
import { NativeAppListService } from '../../services/nativeapplist.service';
import { NativeApp } from '../../models/nativeapp.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface DisplayApp {
  _id: string;
  name: string;
  url: string;
  icon: string;
  safeIcon?: SafeHtml;
  type: string;
}

@Component({
  selector: 'app-quick-access-bar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="fixed bottom-8 left-0 right-0 z-20">
      <div class="mx-auto flex items-center justify-between max-w-xs bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
        <button
          *ngFor="let app of displayApps"
          (click)="openApp(app)"
          class="size-12 flex items-center justify-center rounded-full transition-transform active:scale-90 focus:outline-none"
          [attr.aria-label]="'Open ' + app.name"
        >
          <img
            *ngIf="isCustomIcon(app.name)"
            [ngSrc]="getCustomIconPath(app.name)"
            width="36"
            height="36"
            alt="{{app.name}}"
            class="size-9"
          />
          <div
            *ngIf="!isCustomIcon(app.name) && app.safeIcon"
            class="size-9 text-white/90 flex items-center justify-center"
            [innerHTML]="app.safeIcon">
          </div>
        </button>
      </div>
    </div>
  `
})
export class QuickAccessBarComponent implements OnInit {
  // The list of apps we want to show in the quick access bar
  targetAppNames = ['Phone', 'Messaging', 'WhatsApp', 'Camera'];
  displayApps: DisplayApp[] = [];

  constructor(
    private nativeAppService: NativeAppListService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadNativeApps();
  }

  loadNativeApps() {
    this.nativeAppService.apps$.subscribe({
      next: (apps) => {
        // Filter for our target apps and format them for display
        this.displayApps = apps
          .filter(app => this.isTargetApp(app.name))
          .map(app => this.convertToDisplayApp(app))
          .sort((a, b) => {
            // Sort by the order in targetAppNames
            return this.targetAppNames.indexOf(a.name) - this.targetAppNames.indexOf(b.name);
          });

        // If we don't have 4 apps, log a warning
        if (this.displayApps.length < this.targetAppNames.length) {
          console.warn('Some target apps not found in native app list');
        }
      },
      error: (error) => console.error('Error loading native apps:', error)
    });

    // Also trigger a sync with server to ensure we have the latest data
    this.nativeAppService.syncWithServer().subscribe();
  }

  isTargetApp(name: string): boolean {
    return this.targetAppNames.some(targetName =>
      name.toLowerCase().includes(targetName.toLowerCase())
    );
  }

  convertToDisplayApp(app: NativeApp): DisplayApp {
    return {
      _id: app._id,
      name: app.name,
      url: app.uri,
      icon: app.icon,
      safeIcon: this.sanitizer.bypassSecurityTrustHtml(app.icon),
      type: 'nativeApp'
    };
  }

  isCustomIcon(name: string): boolean {
    // Return true for apps where we want to use our custom icons
    return ['Phone', 'Messaging', 'WhatsApp', 'Camera'].includes(name);
  }

  getCustomIconPath(name: string): string {
    // Map app names to their custom icon paths
    const iconMap: Record<string, string> = {
      'Phone': '/assets/images/icons8Phone.png',
      'Messaging': '/assets/images/icons8Messages.png',
      'WhatsApp': '/assets/images/icons8Whatsapp.png',
      'Camera': '/assets/images/icons8Camera.png'
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
}
