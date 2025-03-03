import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { NgOptimizedImage } from '@angular/common';
import { QuickAccessBarComponent } from '../quick-access-bar/quick-access-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchComponent, NgOptimizedImage, QuickAccessBarComponent],
  template: `
    <div class="min-h-screen relative">
      <div class="absolute inset-0 -z-10">
        <img
          ngSrc="/assets/images/background.jpg"
          fill
          priority
          alt="Background"
          class="object-cover w-full h-full"
        />
        <div class="absolute inset-0 bg-black/30"></div>
      </div>

      <div class="relative z-10">
        <app-search></app-search>
      </div>

      <app-quick-access-bar></app-quick-access-bar>
    </div>
  `
})
export class HomeComponent {}
