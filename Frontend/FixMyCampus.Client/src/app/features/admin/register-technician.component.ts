import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-technician',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-800 mb-2">Register Technician</h2>
      <p class="text-sm text-slate-500 mb-6">Create a new technician account with a specialty domain.</p>

      @if (errorMessage()) {
        <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {{ errorMessage() }}
        </div>
      }

      @if (successMessage()) {
        <div class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
          {{ successMessage() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Full Name</label>
          <input formControlName="name" type="text" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="Abel Tech">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Campus Email</label>
          <input formControlName="email" type="email" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="abel.tech@campus.edu">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Temporary Password</label>
          <input formControlName="password" type="password" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="Password123!">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Specialty</label>
          <select formControlName="specialty" class="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white">
            <option value="IT">IT</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Facility">Facility</option>
          </select>
        </div>

        <button type="submit" [disabled]="form.invalid || isLoading()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
          @if (isLoading()) { Registering... } @else { Provision Technician }
        </button>
      </form>
    </div>
  `
})
export class RegisterTechnicianComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    specialty: ['IT', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.post('/admin/tickets/technicians', this.form.value).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set(`Technician ${res.name} successfully registered.`);
        this.form.reset({ specialty: 'IT' });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to register technician.');
      }
    });
  }
}