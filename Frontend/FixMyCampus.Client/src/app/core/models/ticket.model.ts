export type Role = 'Reporter' | 'Technician' | 'Admin';
export type TicketStatus = 'New' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketCategory = 'IT' | 'Plumbing' | 'Electrical' | 'Facility';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Building {
  id: number;
  name: string;
  code: string;
}

export interface Room {
  id: number;
  buildingId: number;
  roomNumber: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  urgency: UrgencyLevel;
  status: TicketStatus;
  buildingId?: number;
  buildingName?: string;
  roomId?: number;
  roomNumber?: string;
  specificLocation?: string;
  reporterId: number;
  reporterName: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketHistory {
  id: number;
  ticketId: number;
  changedByName: string;
  previousStatus: string;
  newStatus: string;
  comment: string;
  timestamp: string;
}