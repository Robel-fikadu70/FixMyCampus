import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketStatus } from '../../core/models/ticket.model';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-technician-tasks',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-6 border-b border-slate-200 pb-4">
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">My Assigned Tasks</h1>
        <p class="text-slate-500 text-sm mt-1">Manage and update status for tickets assigned to you.</p>
      </div>

      @if (errorMessage()) {
        <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md shadow-sm">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ errorMessage() }}
          </div>
        </div>
      }

      <div class="space-y-4">
        @for (ticket of tickets(); track ticket.id) {
          <div class="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col md:flex-row md:items-stretch overflow-hidden">
            <!-- Left Info Panel -->
            <div class="p-5 flex-1 bg-slate-50/50">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-mono text-xs text-slate-500 font-medium">{{ ticket.ticketNumber }}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border"
                  [class.bg-yellow-50]="ticket.status === 'New'" [class.text-yellow-700]="ticket.status === 'New'" [class.border-yellow-200]="ticket.status === 'New'"
                  [class.bg-blue-50]="ticket.status === 'In Progress' || ticket.status === 'Assigned'" [class.text-blue-700]="ticket.status === 'In Progress' || ticket.status === 'Assigned'" [class.border-blue-200]="ticket.status === 'In Progress' || ticket.status === 'Assigned'"
                  [class.bg-green-50]="ticket.status === 'Resolved'" [class.text-green-700]="ticket.status === 'Resolved'" [class.border-green-200]="ticket.status === 'Resolved'">
                  {{ ticket.status }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600">
                  Urgency: <span class="font-semibold">{{ ticket.urgency }}</span>
                </span>
              </div>

              <h3 class="font-semibold text-slate-900 text-lg mb-1">{{ ticket.title }}</h3>
              <p class="text-slate-600 text-sm line-clamp-2 mb-3">{{ ticket.description }}</p>

              <div class="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                <span class="flex items-center gap-1"><span class="font-medium text-slate-700">Cat:</span> {{ ticket.category }}</span>
                <span class="flex items-center gap-1"><span class="font-medium text-slate-700">Loc:</span> {{ ticket.buildingName ? ticket.buildingName + ' (' + ticket.roomNumber + ')' : ticket.specificLocation }}</span>
              </div>
            </div>

            <!-- Right Action Panel -->
            <div class="p-5 md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white flex flex-col justify-between">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Status Update Note</label>
                <textarea [(ngModel)]="comments[ticket.id]" rows="2" placeholder="e.g., Diagnostics complete..." class="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-slate-900 focus:ring-slate-900 p-2 border"></textarea>
              </div>

              <div class="mt-4 flex flex-col space-y-2">
                @if (ticket.status === 'Assigned') {
                  <button (click)="updateStatus(ticket.id, 'In Progress')" class="w-full bg-slate-900 text-white py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">Start Work</button>
                }
                @if (ticket.status === 'In Progress' || ticket.status === 'Assigned') {
                  <button (click)="updateStatus(ticket.id, 'Resolved')" class="w-full bg-white border border-slate-300 text-slate-900 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">Mark Resolved</button>
                }
                @if (ticket.status === 'Resolved') {
                  <div class="flex items-center gap-2 justify-center py-2 text-sm text-slate-500 bg-slate-50 rounded border border-slate-100">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Awaiting confirmation
                  </div>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center text-slate-500 bg-white rounded-md border border-slate-200 shadow-sm">
            <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p>You have no pending tasks.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class TechnicianTasksComponent implements OnInit {
  private http = inject(HttpClient);
  
  tickets = signal<Ticket[]>([]);
  comments: { [key: number]: string } = {};
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.http.get<Ticket[]>('/technician/tickets').subscribe(data => this.tickets.set(data));
  }

  updateStatus(ticketId: number, newStatus: TicketStatus) {
    const comment = this.comments[ticketId] || '';
    this.errorMessage.set(null);

    this.http.put(`/technician/tickets/${ticketId}/status`, { newStatus, comment }).subscribe({
      next: () => {
        this.comments[ticketId] = '';
        this.loadTasks();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || 'Failed to update ticket status.');
      }
    });
  }
}