import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DecodedToken {
  sub?: string;
  email?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
  role?: string; // Single role from login response
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private readonly userSubject = new BehaviorSubject<DecodedToken | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor() {
    this.restore();
  }

  setTokens(access: string, refresh?: string | null, role?: string) {
    this.accessToken = access;
    localStorage.setItem('accessToken', access);
    if (refresh) {
      this.refreshToken = refresh;
      localStorage.setItem('refreshToken', refresh);
    }
    
    // Store role from login response
    if (role) {
      localStorage.setItem('userRole', role);
    }
    
    const decodedUser = this.decode(access);
    // Add role from login response if not present in JWT
    if (decodedUser && role && !decodedUser.roles && !decodedUser.role) {
      decodedUser.role = role;
      decodedUser.roles = [role]; // Convert single role to array for consistency
    }
    
    this.userSubject.next(decodedUser);
  }

  getAccessToken(): string | null { return this.accessToken; }
  getRefreshToken(): string | null { return this.refreshToken; }
  getCurrentUser(): DecodedToken | null { return this.userSubject.value; }
  isAuthenticated(): boolean { return !!this.accessToken; }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    this.userSubject.next(null);
  }

  private restore() {
    const at = localStorage.getItem('accessToken');
    const storedRole = localStorage.getItem('userRole');
    
    if (at) {
      this.accessToken = at;
      const decodedUser = this.decode(at);
      
      // Restore role from localStorage if not in JWT
      if (decodedUser && storedRole && !decodedUser.roles && !decodedUser.role) {
        decodedUser.role = storedRole;
        decodedUser.roles = [storedRole];
      }
      
      this.userSubject.next(decodedUser);
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
