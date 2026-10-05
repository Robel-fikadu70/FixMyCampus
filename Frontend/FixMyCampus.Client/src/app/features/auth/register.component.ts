import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Create Account</h2>
        <p class="text-sm text-slate-500 mb-6">Register as a Campus Reporter</p>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Full Name</label>
            <input formControlName="name" type="text" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="Isaac Newton">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Campus Email</label>
            <input formControlName="email" type="email" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="isaac@campus.edu">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Password</label>
            <input formControlName="password" type="password" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="Password123!">
          </div>

          <button type="submit" [disabled]="form.invalid || isLoading()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
            @if (isLoading()) { Registering... } @else { Create Account }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Already have an account? <a routerLink="/auth/login" class="text-blue-600 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form.value as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/feed']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed.');
      }
    });
  }
}