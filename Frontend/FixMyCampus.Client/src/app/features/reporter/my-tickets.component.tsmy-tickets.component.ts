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
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">My Reported Tickets</h1>
          <p class="text-slate-500 text-sm">Track status and confirm resolutions for issues you reported.</p>
        </div>
        <a routerLink="/reporter/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ Report Issue</a>
      </div>

      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3">Ticket #</th>
              <th class="px-6 py-3">Title</th>
              <th class="px-6 py-3">Category</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3">Date Created</th>
              <th class="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-sm">
            @for (ticket of tickets(); track ticket.id) {
              <tr>
                <td class="px-6 py-4 font-mono font-bold text-blue-600">{{ ticket.ticketNumber }}</td>
                <td class="px-6 py-4 font-medium text-slate-900">{{ ticket.title }}</td>
                <td class="px-6 py-4 text-slate-600">{{ ticket.category }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    [class.bg-yellow-100]="ticket.status === 'New'" [class.text-yellow-800]="ticket.status === 'New'"
                    [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-800]="ticket.status === 'Resolved'">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ ticket.createdAt | date:'mediumDate' }}</td>
                <td class="px-6 py-4 text-right">
                  <a [routerLink]="['/tickets', ticket.id]" class="text-blue-600 font-medium hover:underline">View &rarr;</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">You haven't reported any tickets yet.</td>
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