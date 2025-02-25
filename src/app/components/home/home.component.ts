import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchComponent, NgOptimizedImage],
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

      <!-- Content -->
      <div class="relative z-10">
        <app-search></app-search>
      </div>
    </div>
  `
})
export class HomeComponent {}
