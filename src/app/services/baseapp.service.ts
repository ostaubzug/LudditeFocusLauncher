import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { CapacitorHttp } from '@capacitor/core';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class BaseappService<T> {
  protected abstract get STORAGE_KEY(): string;
  protected abstract get API_URL(): string;

  private appsSubject = new BehaviorSubject<T[]>([]);
  public apps$ = this.appsSubject.asObservable();

  constructor(protected authService: AuthService) {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      if (!this.STORAGE_KEY) {
        console.error('STORAGE_KEY is not defined');
        return;
      }
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (value) {
        const apps = JSON.parse(value);
        this.appsSubject.next(apps);
      }
    } catch (error) {
      console.error(`Error loading apps from storage (${this.STORAGE_KEY}):`, error);
    }
  }

  protected async saveToStorage(apps: T[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(apps)
      });
      this.appsSubject.next(apps);
    } catch (error) {
      console.error(`Error saving apps to storage (${this.STORAGE_KEY}):`, error);
      throw error;
    }
  }

  syncWithServer(): Observable<T[]> {
    console.log(`Attempting to sync with server: ${this.API_URL}`);

    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        return from(CapacitorHttp.get({
          url: this.API_URL,
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }));
      }),
      map(response => {
        console.log('Server response:', response);
        if (response.status === 200) {
          return response.data as T[];
        } else if (response.status === 401) {
          // Handle unauthorized error
          this.authService.logout(); // Force logout if token is invalid
          throw new Error('Authentication required');
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
          const cachedApps = this.appsSubject.value;
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

  getAppList(): T[] {
    return this.appsSubject.value;
  }
}
