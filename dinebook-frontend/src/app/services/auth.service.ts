import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  get isLoggedIn(): boolean {
    return this.loggedIn.getValue();
  }

  get isLoggedIn$() {
    return this.loggedIn.asObservable();
  }

  login(token?: string) {
    if (token) {
      localStorage.setItem('token', token);
    }
    this.loggedIn.next(true);
  }

  logout() {
    this.loggedIn.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.loggedIn.next(true);
  }

  removeToken(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }
}