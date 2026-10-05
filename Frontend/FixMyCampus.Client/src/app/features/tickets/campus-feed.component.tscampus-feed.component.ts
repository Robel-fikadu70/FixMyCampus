import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketCategory, TicketStatus } from '../../core/models/ticket.model';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-campus-feed',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-6 border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Campus Issue Feed</h1>
          <p class="text-slate-500 text-sm mt-1">Check existing reports before submitting a new one.</p>
        </div>
        <div class="flex gap-3">
          <select [(ngModel)]="filterStatus" (change)="loadFeed()" class="border border-slate-300 px-3 py-1.5 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900">
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select [(ngModel)]="filterCategory" (change)="loadFeed()" class="border border-slate-300 px-3 py-1.5 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900">
            <option value="">All Categories</option>
            <option value="IT">IT</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Facility">Facility</option>
          </select>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-md shadow-sm">
        <ul class="divide-y divide-slate-200">
          @for (ticket of tickets(); track ticket.id) {
            <li class="p-4 hover:bg-slate-50 transition-colors">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-mono text-xs text-slate-500 font-medium">{{ ticket.ticketNumber }}</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border"
                      [class.bg-yellow-50]="ticket.status === 'New'" [class.text-yellow-700]="ticket.status === 'New'" [class.border-yellow-200]="ticket.status === 'New'"
                      [class.bg-blue-50]="ticket.status === 'In Progress' || ticket.status === 'Assigned'" [class.text-blue-700]="ticket.status === 'In Progress' || ticket.status === 'Assigned'" [class.border-blue-200]="ticket.status === 'In Progress' || ticket.status === 'Assigned'"
                      [class.bg-green-50]="ticket.status === 'Resolved'" [class.text-green-700]="ticket.status === 'Resolved'" [class.border-green-200]="ticket.status === 'Resolved'"
                      [class.bg-slate-50]="ticket.status === 'Closed'" [class.text-slate-600]="ticket.status === 'Closed'" [class.border-slate-200]="ticket.status === 'Closed'">
                      {{ ticket.status }}
                    </span>
                  </div>
                  <h3 class="font-medium text-slate-900 text-base mb-1">
                    <a [routerLink]="['/tickets', ticket.id]" class="hover:underline">{{ ticket.title }}</a>
                  </h3>
                  <div class="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {{ ticket.category }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {{ ticket.buildingName ? ticket.buildingName + ' (' + ticket.roomNumber + ')' : ticket.specificLocation }}
                    </span>
                  </div>
                </div>
                <div class="text-right flex flex-col justify-between">
                  <span class="text-xs text-slate-500">Reported by {{ ticket.reporterName }}</span>
                  <div class="mt-2">
                    <a [routerLink]="['/tickets', ticket.id]" class="text-sm font-medium text-slate-900 hover:underline border border-slate-300 rounded px-3 py-1 bg-white hover:bg-slate-50 transition-colors">View Details</a>
                  </div>
                </div>
              </div>
            </li>
          } @empty {
            <li class="p-8 text-center text-slate-500">
              No tickets match your filter criteria.
            </li>
          }
        </ul>
      </div>
    </div>
  `
})
export class CampusFeedComponent implements OnInit {
  private http = inject(HttpClient);

  tickets = signal<Ticket[]>([]);
  filterStatus = '';
  filterCategory = '';

  ngOnInit() {
    this.loadFeed();
  }

  loadFeed() {
    let query = '?';
    if (this.filterStatus) query += `status=${this.filterStatus}&`;
    if (this.filterCategory) query += `category=${this.filterCategory}&`;

    this.http.get<Ticket[]>(`/tickets${query}`).subscribe(data => this.tickets.set(data));
  }
}