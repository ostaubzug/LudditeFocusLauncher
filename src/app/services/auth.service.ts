import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { CapacitorHttp } from '@capacitor/core';

export interface User {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly API_URL = 'http://195.15.192.3:3000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      const { value } = await Preferences.get({ key: this.TOKEN_KEY });

      if (value) {
        this.verifyToken(value).subscribe({
          next: (isValid) => {
            if (isValid) {
              const user = this.parseJwt(value);
              this.currentUserSubject.next({ username: user.username });
              this.isAuthenticatedSubject.next(true);
            } else {
              this.logout();
            }
          },
          error: () => this.logout()
        });
      }
    } catch (error) {
      console.error('Error loading token:', error);
      this.logout();
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT', e);
      return {};
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      CapacitorHttp.post({
        url: this.API_URL,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          username,
          password
        }
      }).then(response => {
        if (response.status === 200 && response.data.token) {
          // Store token
          Preferences.set({
            key: this.TOKEN_KEY,
            value: response.data.token
          });

          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);

          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }).catch(error => {
        console.error('Login error:', error);
        observer.error(error);
        observer.complete();
      });
    });
  }

  register(username: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      CapacitorHttp.post({
        url: `${this.API_URL}/register`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          username,
          password
        }
      }).then(response => {
        if (response.status === 201) {
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }).catch(error => {
        console.error('Registration error:', error);
        observer.error(error);
        observer.complete();
      });
    });
  }

  logout(): void {
    Preferences.remove({ key: this.TOKEN_KEY });

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): Promise<string | null> {
    return Preferences.get({ key: this.TOKEN_KEY })
      .then(result => result.value);
  }

  verifyToken(token: string): Observable<boolean> {
    return new Observable(observer => {
      CapacitorHttp.get({
        url: this.API_URL,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        const isValid = response.status === 200;
        observer.next(isValid);
        observer.complete();
      }).catch(() => {
        observer.next(false);
        observer.complete();
      });
    });
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
