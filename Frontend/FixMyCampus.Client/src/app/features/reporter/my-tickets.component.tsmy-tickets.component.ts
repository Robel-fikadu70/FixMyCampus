import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../../core/models/ticket.model';
import { RouterLink } from '@angular/router';
import {DatePipe}  from "@angular/common";
@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">My Reported Tickets</h1>
          <p class="text-slate-500 text-sm mt-1">Track status and confirm resolutions for issues you reported.</p>
        </div>
        <a routerLink="/reporter/create" class="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Report Issue
        </a>
      </div>

      <div class="bg-white rounded-md shadow-sm border border-slate-200 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title & Category</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-sm bg-white">
            @for (ticket of tickets(); track ticket.id) {
              <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500 font-medium">{{ ticket.ticketNumber }}</td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900">{{ ticket.title }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ ticket.category }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border inline-block"
                    [class.bg-yellow-50]="ticket.status === 'New'" [class.text-yellow-700]="ticket.status === 'New'" [class.border-yellow-200]="ticket.status === 'New'"
                    [class.bg-blue-50]="ticket.status === 'In Progress' || ticket.status === 'Assigned'" [class.text-blue-700]="ticket.status === 'In Progress' || ticket.status === 'Assigned'" [class.border-blue-200]="ticket.status === 'In Progress' || ticket.status === 'Assigned'"
                    [class.bg-green-50]="ticket.status === 'Resolved'" [class.text-green-700]="ticket.status === 'Resolved'" [class.border-green-200]="ticket.status === 'Resolved'"
                    [class.bg-slate-50]="ticket.status === 'Closed'" [class.text-slate-600]="ticket.status === 'Closed'" [class.border-slate-200]="ticket.status === 'Closed'">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">{{ ticket.createdAt | date:'MMM d, y' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <a [routerLink]="['/tickets', ticket.id]" class="text-sm font-medium text-slate-900 hover:underline px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">View</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p>You haven't reported any tickets yet.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MyTicketsComponent implements OnInit {
  private http = inject(HttpClient);
  tickets = signal<Ticket[]>([]);

  ngOnInit() {
    this.http.get<Ticket[]>('/tickets/my').subscribe(data => this.tickets.set(data));
  }
}