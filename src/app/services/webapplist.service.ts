import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { WebApp } from '../models/webapp.interface';
import { Preferences } from '@capacitor/preferences';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class WebAppListService {
  private readonly STORAGE_KEY = 'webAppListService';
  private readonly API_URL = 'http://195.15.192.3:3000/api/apps';

  private webAppsSubject = new BehaviorSubject<WebApp[]>([]);
  public apps$ = this.webAppsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (value) {
        const apps = JSON.parse(value);
        this.webAppsSubject.next(apps);
      }
    } catch (error) {
      console.error('Error loading apps from storage:', error);
    }
  }

  private async saveToStorage(apps: WebApp[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(apps)
      });
      this.webAppsSubject.next(apps);
    } catch (error) {
      console.error('Error saving apps to storage:', error);
      throw error;
    }
  }

  syncWithServer(): Observable<WebApp[]> {
    console.log('Attempting to sync with server using Capacitor HTTP');

    // Use Capacitor HTTP plugin instead of Angular's HttpClient
    return from(CapacitorHttp.get({
      url: this.API_URL,
      headers: {
        'Accept': 'application/json'
      }
    })).pipe(
      map(response => {
        console.log('Server response:', response);
        if (response.status === 200) {
          return response.data as WebApp[];
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }),
      tap({
        next: async (apps) => {
          console.log('Received apps from server:', apps);
          if (Array.isArray(apps) && apps.length > 0) {
            await this.saveToStorage(apps);
          } else {
            console.warn('Received empty or invalid apps array from server');
          }
        },
        error: (error) => {
          console.error('Error syncing apps:', error);
          const cachedApps = this.webAppsSubject.value;
          if (cachedApps.length > 0) {
            console.info('Continuing to use cached data from last successful sync');
          }
        }
      }),
      catchError(error => {
        console.error('Error in syncWithServer:', error);
        throw error;
      })
    );
  }

  getWebAppList(): WebApp[] {
    return this.webAppsSubject.value;
  }
}
