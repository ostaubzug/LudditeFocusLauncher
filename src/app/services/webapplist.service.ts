import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import { WebApp } from '../models/webapp.interface';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class WebAppListService {
  private readonly STORAGE_KEY = 'webAppList';
  private readonly API_URL = 'http://195.15.192.3:3000/api/apps';

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
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<WebApp[]>(this.API_URL, {
      headers,
      responseType: 'json'
    }).pipe(
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
        console.error('Error in syncWithServer:', error);
        throw error;
      })
    );
  }

  getWebAppList(): WebApp[] {
    return this.webAppsSubject.value;
  }
}
