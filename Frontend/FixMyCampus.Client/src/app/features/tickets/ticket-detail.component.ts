import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketHistory } from '../../core/models/ticket.model';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    @if (ticket()) {
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-start">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="font-mono text-sm text-slate-500 font-medium">Ticket {{ ticket()?.ticketNumber }}</span>
              <span class="px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border"
                [class.bg-yellow-50]="ticket()?.status === 'New'" [class.text-yellow-700]="ticket()?.status === 'New'" [class.border-yellow-200]="ticket()?.status === 'New'"
                [class.bg-blue-50]="ticket()?.status === 'In Progress' || ticket()?.status === 'Assigned'" [class.text-blue-700]="ticket()?.status === 'In Progress' || ticket()?.status === 'Assigned'" [class.border-blue-200]="ticket()?.status === 'In Progress' || ticket()?.status === 'Assigned'"
                [class.bg-green-50]="ticket()?.status === 'Resolved'" [class.text-green-700]="ticket()?.status === 'Resolved'" [class.border-green-200]="ticket()?.status === 'Resolved'"
                [class.bg-slate-50]="ticket()?.status === 'Closed'" [class.text-slate-600]="ticket()?.status === 'Closed'" [class.border-slate-200]="ticket()?.status === 'Closed'">
                {{ ticket()?.status }}
              </span>
            </div>
            <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">{{ ticket()?.title }}</h1>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Details -->
            <div class="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Description</h2>
              <p class="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{{ ticket()?.description }}</p>
              
              <!-- Technician Volunteer Section -->
              @if (auth.currentUser()?.role === 'Technician' && (ticket()?.status === 'New' || !ticket()?.assignedTechnicianName)) {
                <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-slate-900">Volunteer for Task</h3>
                    <p class="text-sm text-slate-500">Suggest to the admin that you are available to fix this issue.</p>
                  </div>
                  <button (click)="suggestFix()" class="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm ml-4 whitespace-nowrap">
                    Suggest Fixing It
                  </button>
                </div>
              }
            </div>

            <!-- Reporter Feedback Section -->
            @if (ticket()?.status === 'Resolved') {
              <div class="bg-white border-2 border-emerald-500 rounded-md p-5 shadow-sm">
                <h3 class="text-base font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Action Required: Confirm Resolution
                </h3>
                <p class="text-sm text-emerald-800 mb-4">The technician has marked this issue as resolved. Please verify the fix.</p>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-emerald-900 mb-1">Rejection Reason <span class="text-slate-500 font-normal">(only if rejecting)</span></label>
                    <textarea [(ngModel)]="rejectComment" rows="2" class="w-full rounded-md border-emerald-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2" placeholder="Explain why the issue persists..."></textarea>
                  </div>
                  <div class="flex space-x-3">
                    <button (click)="confirmFix()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">Confirm Fix</button>
                    <button (click)="rejectFix()" class="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">Reject</button>
                  </div>
                </div>
              </div>
            }

            <!-- Audit Timeline -->
            <div class="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">Timeline</h3>
              <div class="space-y-4">
                @for (log of history(); track log.id; let last = $last) {
                  <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                      <div class="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5"></div>
                      @if (!last) { <div class="w-px h-full bg-slate-200 mt-2 mb-1"></div> }
                    </div>
                    <div class="pb-4">
                      <div class="text-xs text-slate-500 mb-0.5">{{ log.timestamp | date:'MMM d, y, h:mm a' }}</div>
                      <div class="text-sm text-slate-900"><span class="font-medium">{{ log.changedByName }}</span> updated status to <span class="font-medium">{{ log.newStatus }}</span></div>
                      @if (log.comment) {
                        <div class="mt-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-md">{{ log.comment }}</div>
                      }
                    </div>
                  </div>
                } @empty {
                  <p class="text-sm text-slate-500 italic">No timeline events recorded.</p>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar metadata -->
          <div class="space-y-6">
            <div class="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Ticket Details</h3>
              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-slate-500">Category</dt>
                  <dd class="font-medium text-slate-900 mt-0.5">{{ ticket()?.category }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Urgency</dt>
                  <dd class="font-medium text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" [class.bg-slate-400]="ticket()?.urgency === 'Low'" [class.bg-blue-500]="ticket()?.urgency === 'Medium'" [class.bg-orange-500]="ticket()?.urgency === 'High'" [class.bg-red-600]="ticket()?.urgency === 'Critical'"></span>
                    {{ ticket()?.urgency }}
                  </dd>
                </div>
                <div>
                  <dt class="text-slate-500">Location</dt>
                  <dd class="font-medium text-slate-900 mt-0.5">{{ ticket()?.buildingName ? ticket()?.buildingName + ' (' + ticket()?.roomNumber + ')' : ticket()?.specificLocation }}</dd>
                </div>
                <div class="pt-3 border-t border-slate-100">
                  <dt class="text-slate-500">Reported By</dt>
                  <dd class="font-medium text-slate-900 mt-0.5">{{ ticket()?.reporterName }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Assigned Technician</dt>
                  <dd class="font-medium text-slate-900 mt-0.5">{{ ticket()?.assignedTechnicianName || 'Unassigned' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  auth = inject(AuthService);

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

  suggestFix() {
    const id = this.ticket()?.id;
    if (!id) return;
    this.http.post(`/technician/tickets/${id}/suggest`, {}).subscribe({
      next: () => {
        alert('Your suggestion has been sent to the admin.');
        this.loadTicketData(id.toString());
      },
      error: () => {
        alert('Your suggestion has been sent to the admin.');
      }
    });
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