import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchComponent],
  template: `
    <div class="min-h-screen bg-cover bg-center bg-no-repeat relative"
         style="background-image: url('/assets/images/background.jpg')">
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="relative z-10">
        <app-search></app-search>
      </div>
    </div>
  `
})
export class HomeComponent {}
