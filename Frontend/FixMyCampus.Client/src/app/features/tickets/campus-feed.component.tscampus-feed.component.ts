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
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Campus Issue Feed</h1>
          <p class="text-slate-500 text-sm">Check existing reports before submitting a new one.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4">
        <select [(ngModel)]="filterStatus" (change)="loadFeed()" class="border p-2 rounded text-sm bg-white">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select [(ngModel)]="filterCategory" (change)="loadFeed()" class="border p-2 rounded text-sm bg-white">
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Facility">Facility</option>
        </select>
      </div>

      <!-- Ticket Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (ticket of tickets(); track ticket.id) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">{{ ticket.ticketNumber }}</span>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  [class.bg-yellow-100]="ticket.status === 'New'" [class.text-yellow-800]="ticket.status === 'New'"
                  [class.bg-blue-100]="ticket.status === 'In Progress'" [class.text-blue-800]="ticket.status === 'In Progress'"
                  [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-800]="ticket.status === 'Resolved'"
                  [class.bg-slate-100]="ticket.status === 'Closed'" [class.text-slate-800]="ticket.status === 'Closed'">
                  {{ ticket.status }}
                </span>
              </div>

              <h3 class="font-bold text-slate-800 text-lg mb-2">{{ ticket.title }}</h3>
              <p class="text-slate-600 text-sm line-clamp-2 mb-4">{{ ticket.description }}</p>

              <div class="text-xs text-slate-500 space-y-1 mb-4 border-t pt-3">
                <p><span class="font-medium text-slate-700">Category:</span> {{ ticket.category }}</p>
                <p><span class="font-medium text-slate-700">Location:</span> {{ ticket.buildingName ? ticket.buildingName + ' (' + ticket.roomNumber + ')' : ticket.specificLocation }}</p>
              </div>
            </div>

            <div class="pt-4 border-t flex justify-between items-center">
              <span class="text-xs text-slate-400">By {{ ticket.reporterName }}</span>
              <a [routerLink]="['/tickets', ticket.id]" class="text-blue-600 text-sm font-medium hover:underline">View Details &rarr;</a>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-12 text-center text-slate-400">
            No tickets match your filter criteria.
          </div>
        }
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