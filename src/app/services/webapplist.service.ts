import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import { WebApp } from '../models/webapp.interface';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class WebAppListService {
  private readonly STORAGE_KEY = 'cached_webapp_list';
  private readonly API_URL = 'http://localhost:3000/api/apps';

  private webAppsSubject = new BehaviorSubject<WebApp[]>([]);
  public apps$ = this.webAppsSubject.asObservable();

  constructor(private http: HttpClient) {
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
    return this.http.get<WebApp[]>(this.API_URL).pipe(
      tap({
        next: async (apps) => {
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
        throw error;
      })
    );
  }

  getApps(): WebApp[] {
    return this.webAppsSubject.value;
  }
}
