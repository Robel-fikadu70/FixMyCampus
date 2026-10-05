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
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-2">My Assigned Tasks</h1>
      <p class="text-slate-500 text-sm mb-6">Manage and update status for tickets assigned to you.</p>

      @if (errorMessage()) {
        <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {{ errorMessage() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (ticket of tickets(); track ticket.id) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-3">
                <span class="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">{{ ticket.ticketNumber }}</span>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  [class.bg-yellow-100]="ticket.status === 'New'" [class.text-yellow-800]="ticket.status === 'New'"
                  [class.bg-blue-100]="ticket.status === 'Assigned'" [class.text-blue-800]="ticket.status === 'Assigned'"
                  [class.bg-indigo-100]="ticket.status === 'In Progress'" [class.text-indigo-800]="ticket.status === 'In Progress'"
                  [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-800]="ticket.status === 'Resolved'">
                  {{ ticket.status }}
                </span>
              </div>

              <h3 class="font-bold text-slate-800 text-lg mb-2">{{ ticket.title }}</h3>
              <p class="text-slate-600 text-sm mb-4 bg-slate-50 p-3 rounded border">{{ ticket.description }}</p>

              <div class="text-xs text-slate-500 space-y-1 mb-4">
                <p><span class="font-medium text-slate-700">Category:</span> {{ ticket.category }}</p>
                <p><span class="font-medium text-slate-700">Urgency:</span> {{ ticket.urgency }}</p>
                <p><span class="font-medium text-slate-700">Location:</span> {{ ticket.buildingName ? ticket.buildingName + ' (' + ticket.roomNumber + ')' : ticket.specificLocation }}</p>
              </div>
            </div>

            <!-- Status Update Workflow Controls -->
            <div class="border-t pt-4 space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Diagnostic / Resolution Comment</label>
                <input [(ngModel)]="comments[ticket.id]" type="text" placeholder="e.g., Replaced cable / Started diagnostics..." class="w-full text-xs border rounded p-2 border-slate-300">
              </div>

              <div class="flex space-x-2">
                @if (ticket.status === 'Assigned') {
                  <button (click)="updateStatus(ticket.id, 'In Progress')" class="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-medium hover:bg-blue-700">Start In Progress</button>
                }
                @if (ticket.status === 'In Progress' || ticket.status === 'Assigned') {
                  <button (click)="updateStatus(ticket.id, 'Resolved')" class="flex-1 bg-green-600 text-white py-1.5 rounded text-xs font-medium hover:bg-green-700">Mark Resolved</button>
                }
                @if (ticket.status === 'Resolved') {
                  <span class="text-xs text-slate-400 italic">Waiting for reporter confirmation...</span>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border">
            You currently have no tasks assigned to you.
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