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
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Admin Command Center</h1>
          <p class="text-slate-500 text-sm">Manage campus tickets, assign personnel, and view maintenance staff.</p>
        </div>
        <a routerLink="/admin/technicians/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ Register Technician</a>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4">
        <select [(ngModel)]="filterStatus" (change)="loadTickets()" class="border p-2 rounded text-sm bg-white">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select [(ngModel)]="filterCategory" (change)="loadTickets()" class="border p-2 rounded text-sm bg-white">
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Facility">Facility</option>
        </select>
      </div>

      <!-- Tickets Table -->
      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3">Ticket #</th>
              <th class="px-6 py-3">Title</th>
              <th class="px-6 py-3">Location</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3">Assigned Tech</th>
              <th class="px-6 py-3 text-right">Assignment Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-sm">
            @for (ticket of tickets(); track ticket.id) {
              <tr>
                <td class="px-6 py-4 font-mono font-bold text-blue-600">{{ ticket.ticketNumber }}</td>
                <td class="px-6 py-4 font-medium text-slate-900">{{ ticket.title }}</td>
                <td class="px-6 py-4 text-slate-600">
                  {{ ticket.buildingName ? ticket.buildingName + ' (' + ticket.roomNumber + ')' : ticket.specificLocation }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    [class.bg-yellow-100]="ticket.status === 'New'" [class.text-yellow-800]="ticket.status === 'New'"
                    [class.bg-blue-100]="ticket.status === 'Assigned'" [class.text-blue-800]="ticket.status === 'Assigned'"
                    [class.bg-indigo-100]="ticket.status === 'In Progress'" [class.text-indigo-800]="ticket.status === 'In Progress'"
                    [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-800]="ticket.status === 'Resolved'"
                    [class.bg-slate-100]="ticket.status === 'Closed'" [class.text-slate-800]="ticket.status === 'Closed'">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600">
                  {{ ticket.assignedTechnicianName || 'Unassigned' }}
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <select #techSelect class="border text-xs p-1.5 rounded bg-white">
                    <option value="">Select Tech...</option>
                    @for (tech of technicians(); track tech.id) {
                      <option [value]="tech.id">{{ tech.name }}</option>
                    }
                  </select>
                  <button (click)="assignTech(ticket.id, techSelect.value)" class="bg-slate-800 text-white px-3 py-1.5 rounded text-xs hover:bg-slate-700 font-medium">Assign</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">No tickets found matching criteria.</td>
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