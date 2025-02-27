// File: src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoginComponent],
  template: `
    <ng-container *ngIf="isAuthenticated; else loginTemplate">
      <router-outlet></router-outlet>
    </ng-container>

    <ng-template #loginTemplate>
      <app-login></app-login>
    </ng-template>
  `
})
export class AppComponent implements OnInit {
  title = 'LudditeLauncher';
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => this.isAuthenticated = isAuthenticated
    );
  }
}
