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
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'feed', component: CampusFeedComponent, canActivate: [authGuard] },
  { path: 'reporter/dashboard', component: MyTicketsComponent, canActivate: [authGuard], data: { roles: ['Reporter'] } },
  { path: 'reporter/create', component: CreateTicketComponent, canActivate: [authGuard], data: { roles: ['Reporter'] } },
  { path: 'tickets/:id', component: TicketDetailComponent, canActivate: [authGuard] },
  { path: 'technician/tasks', component: TechnicianTasksComponent, canActivate: [authGuard], data: { roles: ['Technician'] } },
  { path: 'admin/command-center', component: CommandCenterComponent, canActivate: [authGuard], data: { roles: ['Admin'] } },
  { path: 'admin/technicians/new', component: RegisterTechnicianComponent, canActivate: [authGuard], data: { roles: ['Admin'] } }
];