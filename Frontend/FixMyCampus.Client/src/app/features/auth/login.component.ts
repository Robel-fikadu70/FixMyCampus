import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
        <p class="text-sm text-slate-500 mb-6">Sign in to access FixMyCampus</p>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Email Address</label>
            <input formControlName="email" type="email" class="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="isaac@campus.edu">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Password</label>
            <input formControlName="password" type="password" class="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="form.invalid || isLoading()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors">
            @if (isLoading()) { Signing in... } @else { Sign In }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <a routerLink="/auth/register" class="text-blue-600 font-medium hover:underline">Register here</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.value as any).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        // Role-based routing redirection
        if (user.role === 'Admin') this.router.navigate(['/admin/command-center']);
        else if (user.role === 'Technician') this.router.navigate(['/technician/tasks']);
        else this.router.navigate(['/feed']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }
}