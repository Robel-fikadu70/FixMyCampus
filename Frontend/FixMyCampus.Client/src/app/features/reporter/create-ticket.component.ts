import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Building, Room } from '../../core/models/ticket.model';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-10">
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-900 tracking-tight">Report Campus Issue</h2>
        <p class="text-slate-500 text-sm mt-1">Provide details about the issue to help us resolve it quickly.</p>
      </div>
      
      <div class="bg-white p-6 md:p-8 rounded-md shadow-sm border border-slate-200">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-900 mb-1">Issue Title</label>
            <input formControlName="title" type="text" class="block w-full rounded-md border-slate-300 shadow-sm border p-2.5 text-sm focus:ring-slate-900 focus:border-slate-900" placeholder="e.g., Projector bulb burnt out">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-900 mb-1">Category</label>
              <select formControlName="category" class="block w-full rounded-md border-slate-300 shadow-sm border p-2.5 text-sm focus:ring-slate-900 focus:border-slate-900">
                <option value="IT">IT</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Facility">Facility</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-900 mb-1">Urgency</label>
              <select formControlName="urgency" class="block w-full rounded-md border-slate-300 shadow-sm border p-2.5 text-sm focus:ring-slate-900 focus:border-slate-900">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-6">
            <div class="flex items-center space-x-4 mb-4">
              <label class="text-sm font-medium text-slate-900">Location Type:</label>
              <div class="flex rounded-md shadow-sm">
                <button type="button" (click)="setLocationType('indoor')" [class.bg-slate-900]="isIndoor()" [class.text-white]="isIndoor()" [class.border-slate-900]="isIndoor()" [class.bg-white]="!isIndoor()" [class.text-slate-600]="!isIndoor()" [class.border-slate-300]="!isIndoor()" class="px-4 py-1.5 text-sm font-medium rounded-l-md border hover:bg-slate-50 transition-colors">Indoor</button>
                <button type="button" (click)="setLocationType('outdoor')" [class.bg-slate-900]="!isIndoor()" [class.text-white]="!isIndoor()" [class.border-slate-900]="!isIndoor()" [class.bg-white]="isIndoor()" [class.text-slate-600]="isIndoor()" [class.border-slate-300]="isIndoor()" class="px-4 py-1.5 text-sm font-medium rounded-r-md border-y border-r hover:bg-slate-50 transition-colors">Outdoor</button>
              </div>
            </div>

            @if (isIndoor()) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div>
                  <label class="block text-sm font-medium text-slate-900 mb-1">Building</label>
                  <select formControlName="buildingId" (change)="onBuildingChange($event)" class="block w-full rounded-md border-slate-300 border p-2.5 text-sm bg-white focus:ring-slate-900 focus:border-slate-900 shadow-sm">
                    <option [value]="null">Select Building</option>
                    @for (b of buildings(); track b.id) {
                      <option [value]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-900 mb-1">Room / Lab</label>
                  <select formControlName="roomId" class="block w-full rounded-md border-slate-300 border p-2.5 text-sm bg-white focus:ring-slate-900 focus:border-slate-900 shadow-sm">
                    <option [value]="null">Select Room</option>
                    @for (r of rooms(); track r.id) {
                      <option [value]="r.id">{{ r.roomNumber }}</option>
                    }
                  </select>
                </div>
              </div>
            } @else {
              <div class="bg-slate-50 p-4 rounded-md border border-slate-200">
                <label class="block text-sm font-medium text-slate-900 mb-1">Specific Outdoor Description</label>
                <input formControlName="specificLocation" type="text" placeholder="e.g., Football Field Bleachers, Quad benches" class="block w-full rounded-md border-slate-300 border p-2.5 text-sm bg-white focus:ring-slate-900 focus:border-slate-900 shadow-sm">
              </div>
            }
          </div>

          <div class="border-t border-slate-100 pt-6">
            <label class="block text-sm font-medium text-slate-900 mb-1">Description</label>
            <textarea formControlName="description" rows="4" class="block w-full rounded-md border-slate-300 border shadow-sm p-3 text-sm focus:ring-slate-900 focus:border-slate-900" placeholder="Describe the issue in detail..."></textarea>
          </div>

          <div class="pt-2">
            <button type="submit" [disabled]="form.invalid" class="w-full bg-slate-900 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors">Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateTicketComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  buildings = signal<Building[]>([]);
  rooms = signal<Room[]>([]);
  isIndoor = signal<boolean>(true);

  form = this.fb.group({
    title: ['', Validators.required],
    category: ['IT', Validators.required],
    urgency: ['Medium', Validators.required],
    buildingId: [null as number | null],
    roomId: [null as number | null],
    specificLocation: [null as string | null],
    description: ['', Validators.required]
  });

  ngOnInit() {
    this.http.get<Building[]>('/buildings').subscribe(data => this.buildings.set(data));
  }

  setLocationType(type: 'indoor' | 'outdoor') {
    if (type === 'indoor') {
      this.isIndoor.set(true);
      this.form.patchValue({ specificLocation: null });
    } else {
      this.isIndoor.set(false);
      this.form.patchValue({ buildingId: null, roomId: null });
    }
  }

  onBuildingChange(event: any) {
    const buildingId = event.target.value;
    if (buildingId) {
      this.http.get<Room[]>(`/buildings/${buildingId}/rooms`).subscribe(data => this.rooms.set(data));
    } else {
      this.rooms.set([]);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.http.post('/tickets', this.form.value).subscribe({
        next: () => this.router.navigate(['/reporter/dashboard'])
      });
    }
  }
}