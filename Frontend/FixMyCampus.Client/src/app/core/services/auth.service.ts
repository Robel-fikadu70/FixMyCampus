import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { User } from '../models/ticket.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<User>('/auth/login', credentials).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post<User>('/auth/register', data).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  loadSession() {
    return this.http.get<User>('/auth/me').pipe(
      tap({
        next: user => this.currentUser.set(user),
        error: () => this.currentUser.set(null)
      })
    );
  }

  logout() {
    return this.http.post('/auth/logout', {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }
}