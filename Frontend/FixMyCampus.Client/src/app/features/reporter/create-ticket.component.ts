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
    <div class="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-800 mb-6">Report Campus Issue</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Issue Title</label>
          <input formControlName="title" type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Projector bulb burnt out">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Category</label>
            <select formControlName="category" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2">
              <option value="IT">IT</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Facility">Facility</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Urgency</label>
            <select formControlName="urgency" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <!-- Location Type Toggle -->
        <div class="flex items-center space-x-4 pt-2">
          <label class="text-sm font-medium text-slate-700">Location Type:</label>
          <button type="button" (click)="setLocationType('indoor')" [class.bg-blue-600]="isIndoor()" [class.text-white]="isIndoor()" class="px-4 py-1.5 text-sm rounded border border-slate-300">Indoor</button>
          <button type="button" (click)="setLocationType('outdoor')" [class.bg-blue-600]="!isIndoor()" [class.text-white]="!isIndoor()" class="px-4 py-1.5 text-sm rounded border border-slate-300">Outdoor</button>
        </div>

        @if (isIndoor()) {
          <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
            <div>
              <label class="block text-sm font-medium text-slate-700">Building</label>
              <select formControlName="buildingId" (change)="onBuildingChange($event)" class="mt-1 block w-full rounded-md border-slate-300 border p-2">
                <option [value]="null">Select Building</option>
                @for (b of buildings(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Room / Lab</label>
              <select formControlName="roomId" class="mt-1 block w-full rounded-md border-slate-300 border p-2">
                <option [value]="null">Select Room</option>
                @for (r of rooms(); track r.id) {
                  <option [value]="r.id">{{ r.roomNumber }}</option>
                }
              </select>
            </div>
          </div>
        } @else {
          <div class="bg-slate-50 p-4 rounded-lg border">
            <label class="block text-sm font-medium text-slate-700">Specific Outdoor Description</label>
            <input formControlName="specificLocation" type="text" placeholder="e.g., Football Field Bleachers, Quad benches" class="mt-1 block w-full rounded-md border-slate-300 border p-2">
          </div>
        }

        <div>
          <label class="block text-sm font-medium text-slate-700">Description</label>
          <textarea formControlName="description" rows="4" class="mt-1 block w-full rounded-md border-slate-300 border p-2" placeholder="Describe the issue in detail..."></textarea>
        </div>

        <button type="submit" [disabled]="form.invalid" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">Submit Ticket</button>
      </form>
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