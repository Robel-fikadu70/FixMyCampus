import { Routes } from '@angular/router';
import { CreateTicketComponent } from './features/reporter/create-ticket.component';
import { CommandCenterComponent } from './features/admin/command-center.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { CampusFeedComponent } from './features/tickets/campus-feed.component.tscampus-feed.component';
import { MyTicketsComponent } from './features/reporter/my-tickets.component.tsmy-tickets.component';
import { TicketDetailComponent } from './features/tickets/ticket-detail.component';
import { TechnicianTasksComponent } from './features/technician/technician-tasks.component';
import { RegisterTechnicianComponent } from './features/admin/register-technician.component';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'feed', component: CampusFeedComponent },
  { path: 'reporter/dashboard', component: MyTicketsComponent },
  { path: 'reporter/create', component: CreateTicketComponent },
  { path: 'tickets/:id', component: TicketDetailComponent },
  { path: 'technician/tasks', component: TechnicianTasksComponent },
  { path: 'admin/command-center', component: CommandCenterComponent },
  { path: 'admin/technicians/new', component: RegisterTechnicianComponent }
];