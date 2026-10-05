import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket, User } from '../../core/models/ticket.model';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Admin Command Center</h1>
          <p class="text-slate-500 text-sm mt-1">Manage campus tickets, assign personnel, and view maintenance staff.</p>
        </div>
        <a routerLink="/admin/technicians/new" class="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Register Technician
        </a>
      </div>

      <!-- Filter Bar -->
      <div class="flex gap-3 mb-4">
        <select [(ngModel)]="filterStatus" (change)="loadTickets()" class="border border-slate-300 px-3 py-1.5 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select [(ngModel)]="filterCategory" (change)="loadTickets()" class="border border-slate-300 px-3 py-1.5 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm">
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Facility">Facility</option>
        </select>
      </div>

      <!-- Tickets Table -->
      <div class="bg-white rounded-md shadow-sm border border-slate-200 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Ticket</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Tech</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-sm bg-white">
            @for (ticket of tickets(); track ticket.id) {
              <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500 font-medium">
                  <a [routerLink]="['/tickets', ticket.id]" class="hover:text-slate-900 hover:underline">{{ ticket.ticketNumber }}</a>
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900 mb-0.5"><a [routerLink]="['/tickets', ticket.id]" class="hover:underline">{{ ticket.title }}</a></div>
                  <div class="text-xs text-slate-500 flex items-center gap-2">
                    <span class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{{ ticket.category }}</span>
                    <span>{{ ticket.buildingName ? ticket.buildingName + ' (' + ticket.roomNumber + ')' : ticket.specificLocation }}</span>
                  </div>
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
                <td class="px-6 py-4 whitespace-nowrap text-slate-600">
                  @if (ticket.assignedTechnicianName) {
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">{{ ticket.assignedTechnicianName.charAt(0) }}</div>
                      <span>{{ ticket.assignedTechnicianName }}</span>
                    </div>
                  } @else {
                    <span class="text-slate-400 italic">Unassigned</span>
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <select #techSelect class="border border-slate-300 text-xs py-1.5 pl-2 pr-6 rounded-md bg-white shadow-sm focus:ring-slate-900 focus:border-slate-900 max-w-[140px] truncate">
                      <option value="">Select Tech...</option>
                      @for (tech of technicians(); track tech.id) {
                        <option [value]="tech.id" [selected]="ticket.assignedTechnicianName === tech.name">{{ tech.name }}</option>
                      }
                    </select>
                    <button (click)="assignTech(ticket.id, techSelect.value)" class="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm">Assign</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  No tickets found matching criteria.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CommandCenterComponent implements OnInit {
  private http = inject(HttpClient);
  
  tickets = signal<Ticket[]>([]);
  technicians = signal<User[]>([]);
  filterStatus = '';
  filterCategory = '';

  ngOnInit() {
    this.loadTickets();
    this.loadTechnicians();
  }

  loadTickets() {
    let query = '?';
    if (this.filterStatus) query += `status=${this.filterStatus}&`;
    if (this.filterCategory) query += `category=${this.filterCategory}&`;

    this.http.get<Ticket[]>(`/admin/tickets${query}`).subscribe(data => this.tickets.set(data));
  }

  loadTechnicians() {
    this.http.get<User[]>('/admin/tickets/technicians').subscribe(data => this.technicians.set(data));
  }

  assignTech(ticketId: number, technicianId: string) {
    if (!technicianId) return;
    this.http.put(`/admin/tickets/${ticketId}/assign`, { technicianId: Number(technicianId) }).subscribe({
      next: () => this.loadTickets()
    });
  }
}