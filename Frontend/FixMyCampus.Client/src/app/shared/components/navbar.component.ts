import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-slate-900 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <span class="text-xl font-bold tracking-wider text-blue-400">FixMyCampus</span>
          <div class="hidden md:flex space-x-4">
            @if (auth.currentUser(); as user) {
              <a routerLink="/feed" class="hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">Campus Feed</a>
              @if (user.role === 'Reporter') {
                <a routerLink="/reporter/dashboard" class="hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">My Tickets</a>
                <a routerLink="/reporter/create" class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">+ Report Issue</a>
              }
              @if (user.role === 'Technician') {
                <a routerLink="/technician/tasks" class="hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">My Tasks</a>
              }
              @if (user.role === 'Admin') {
                <a routerLink="/admin/command-center" class="hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">Command Center</a>
              }
            }
          </div>
        </div>

        <div>
          @if (auth.currentUser(); as user) {
            <div class="flex items-center space-x-4">
              <span class="text-sm text-slate-300">{{ user.name }} (<span class="text-blue-400 font-semibold">{{ user.role }}</span>)</span>
              <button (click)="auth.logout().subscribe()" class="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs">Logout</button>
            </div>
          } @else {
            <div class="space-x-2">
              <a routerLink="/auth/login" class="text-sm hover:underline">Login</a>
              <a routerLink="/auth/register" class="bg-blue-600 px-3 py-1.5 rounded text-sm font-medium">Register</a>
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