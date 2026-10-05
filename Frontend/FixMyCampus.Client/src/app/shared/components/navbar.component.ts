import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <span class="text-xl font-bold tracking-tight text-slate-900">FixMyCampus</span>
          <div class="hidden md:flex space-x-1">
            @if (auth.currentUser(); as user) {
              <a routerLink="/feed" routerLinkActive="bg-slate-100 font-semibold" class="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Campus Feed</a>
              @if (user.role === 'Reporter') {
                <a routerLink="/reporter/dashboard" routerLinkActive="bg-slate-100 font-semibold" class="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Tickets</a>
                <a routerLink="/reporter/create" class="ml-2 bg-slate-900 text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">+ Report Issue</a>
              }
              @if (user.role === 'Technician') {
                <a routerLink="/technician/tasks" routerLinkActive="bg-slate-100 font-semibold" class="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Tasks</a>
              }
              @if (user.role === 'Admin') {
                <a routerLink="/admin/command-center" routerLinkActive="bg-slate-100 font-semibold" class="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Command Center</a>
              }
            }
          </div>
        </div>

        <div>
          @if (auth.currentUser(); as user) {
            <div class="flex items-center space-x-4">
              <span class="text-sm text-slate-600">{{ user.name }} <span class="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">{{ user.role }}</span></span>
              <button (click)="auth.logout().subscribe()" class="text-slate-500 hover:text-slate-900 text-sm font-medium px-2 py-1 rounded hover:bg-slate-50 transition-colors">Logout</button>
            </div>
          } @else {
            <div class="space-x-3 flex items-center">
              <a routerLink="/auth/login" class="text-sm font-medium text-slate-600 hover:text-slate-900">Login</a>
              <a routerLink="/auth/register" class="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</a>
            </div>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
}