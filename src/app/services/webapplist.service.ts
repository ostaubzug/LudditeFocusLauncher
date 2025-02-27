import { Injectable } from '@angular/core';
import { BaseappService } from './baseapp.service';
import { WebApp } from '../models/webapp.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebAppListService extends BaseappService<WebApp> {
  protected get STORAGE_KEY(): string {
    return 'webAppList';
  }

  protected get API_URL(): string {
    return 'http://195.15.192.3:3000/api/webapps';
  }

  constructor(protected override authService: AuthService) {
    super(authService);
  }
}
