import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketHistory } from '../../core/models/ticket.model';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    @if (ticket()) {
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">{{ ticket()?.ticketNumber }}</span>
              <h1 class="text-2xl font-bold text-slate-900 mt-2">{{ ticket()?.title }}</h1>
            </div>
            <span class="px-3 py-1.5 rounded-full text-sm font-semibold"
              [class.bg-yellow-100]="ticket()?.status === 'New'" [class.text-yellow-800]="ticket()?.status === 'New'"
              [class.bg-blue-100]="ticket()?.status === 'In Progress'" [class.text-blue-800]="ticket()?.status === 'In Progress'"
              [class.bg-green-100]="ticket()?.status === 'Resolved'" [class.text-green-800]="ticket()?.status === 'Resolved'"
              [class.bg-slate-100]="ticket()?.status === 'Closed'" [class.text-slate-800]="ticket()?.status === 'Closed'">
              {{ ticket()?.status }}
            </span>
          </div>

          <p class="text-slate-700 mb-6 bg-slate-50 p-4 rounded-lg border">{{ ticket()?.description }}</p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
            <div>
              <span class="text-slate-400 block">Category</span>
              <span class="font-medium text-slate-800">{{ ticket()?.category }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Urgency</span>
              <span class="font-medium text-slate-800">{{ ticket()?.urgency }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Location</span>
              <span class="font-medium text-slate-800">{{ ticket()?.buildingName ? ticket()?.buildingName + ' (' + ticket()?.roomNumber + ')' : ticket()?.specificLocation }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Assigned Tech</span>
              <span class="font-medium text-slate-800">{{ ticket()?.assignedTechnicianName || 'None' }}</span>
            </div>
          </div>
        </div>

        <!-- Reporter Feedback Section (Only when status is Resolved) -->
        @if (ticket()?.status === 'Resolved') {
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 class="text-lg font-bold text-amber-900 mb-2">Issue Marked as Resolved</h3>
            <p class="text-sm text-amber-700 mb-4">Please confirm if the fix was successful or reject it if the issue persists.</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase text-amber-900 mb-1">Rejection Comment (Required if rejecting)</label>
                <textarea [(ngModel)]="rejectComment" rows="2" class="w-full rounded-md border-amber-300 border p-2 text-sm" placeholder="Explain why the fix is unsatisfactory..."></textarea>
              </div>
              <div class="flex space-x-4">
                <button (click)="confirmFix()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Confirm & Close Fix</button>
                <button (click)="rejectFix()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Reject Fix</button>
              </div>
            </div>
          </div>
        }

        <!-- Audit Timeline -->
        <div class="bg-white rounded-xl shadow-sm border p-6">
          <h3 class="text-lg font-bold text-slate-800 mb-4">Ticket Audit History</h3>
          <div class="space-y-6 border-l-2 border-slate-100 pl-4 ml-2">
            @for (log of history(); track log.id) {
              <div class="relative">
                <div class="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></div>
                <div class="text-xs text-slate-400 mb-0.5">{{ log.timestamp | date:'medium' }}</div>
                <div class="text-sm font-medium text-slate-800">{{ log.changedByName }} changed status: <span class="text-blue-600">{{ log.previousStatus }} &rarr; {{ log.newStatus }}</span></div>
                @if (log.comment) {
                  <p class="text-sm text-slate-600 mt-1 bg-slate-50 p-2.5 rounded border">{{ log.comment }}</p>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  ticket = signal<Ticket | null>(null);
  history = signal<TicketHistory[]>([]);
  rejectComment = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTicketData(id);
    }
  }

  loadTicketData(id: string) {
    this.http.get<Ticket>(`/tickets/${id}`).subscribe(data => this.ticket.set(data));
    this.http.get<TicketHistory[]>(`/tickets/${id}/history`).subscribe(data => this.history.set(data));
  }

  confirmFix() {
    const id = this.ticket()?.id;
    this.http.put(`/tickets/${id}/confirm-fix`, {}).subscribe({
      next: () => this.loadTicketData(id!.toString())
    });
  }

  rejectFix() {
    const id = this.ticket()?.id;
    if (!this.rejectComment) {
      alert('A comment is required to reject a fix.');
      return;
    }
    this.http.put(`/tickets/${id}/reject-fix`, { comment: this.rejectComment }).subscribe({
      next: () => {
        this.rejectComment = '';
        this.loadTicketData(id!.toString());
      }
    });
  }
}