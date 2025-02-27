import { Injectable } from '@angular/core';
import { BaseappService } from './baseapp.service';
import { NativeApp } from '../models/nativeapp.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NativeAppListService extends BaseappService<NativeApp> {
  protected get STORAGE_KEY(): string {
    return 'nativeAppList';
  }

  protected get API_URL(): string {
    return 'http://195.15.192.3:3000/api/nativeapps';
  }

  constructor(protected override authService: AuthService) {
    super(authService);
  }
}
