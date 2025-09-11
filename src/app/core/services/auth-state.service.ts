import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DecodedToken {
  sub?: string;
  email?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userSubject = new BehaviorSubject<DecodedToken | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor() {
    this.restore();
  }

  setTokens(access: string, refresh?: string | null) {
    this.accessToken = access;
    localStorage.setItem('accessToken', access);
    if (refresh) {
      this.refreshToken = refresh;
      localStorage.setItem('refreshToken', refresh);
    }
    this.userSubject.next(this.decode(access));
  }

  getAccessToken(): string | null { return this.accessToken; }
  getRefreshToken(): string | null { return this.refreshToken; }
  isAuthenticated(): boolean { return !!this.accessToken; }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
  }

  private restore() {
    const at = localStorage.getItem('accessToken');
    if (at) {
      this.accessToken = at;
      this.userSubject.next(this.decode(at));
    }
    const rt = localStorage.getItem('refreshToken');
    if (rt) this.refreshToken = rt;
  }

  private decode(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch { return null; }
  }
}
