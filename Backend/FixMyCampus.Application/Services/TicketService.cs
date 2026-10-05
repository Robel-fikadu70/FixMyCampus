using Microsoft.EntityFrameworkCore;
using FixMyCampus.Domain.Entities;
using FixMyCampus.Application.Common.Interfaces; // Use Application interface

namespace FixMyCampus.Application.Services;

public class TicketService
{
    private readonly IAppDbContext _context;

    public TicketService(IAppDbContext context)
    {
        _context = context;
    }

    // 1. Create Ticket (Reporter)
    public async Task<Ticket> CreateTicketAsync(string title, string description, string category, string urgency, int? buildingId, int? roomId, string? specificLocation, int reporterId)
    {
        var ticket = new Ticket
        {
            Title = title,
            Description = description,
            Category = category,
            Urgency = urgency ?? "Medium",
            Status = "New",
            BuildingId = buildingId,
            RoomId = roomId,
            SpecificLocation = specificLocation,
            ReporterId = reporterId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // Log initial history
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = reporterId,
            PreviousStatus = "None",
            NewStatus = "New",
            Comment = "Ticket created.",
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketHistories.Add(history);
        await _context.SaveChangesAsync();

        return ticket;
    }

    // 2. Assign Technician (Admin)
    public async Task<(bool Success, string Message)> AssignTechnicianAsync(int ticketId, int technicianId, int adminId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null) return (false, "Ticket not found.");

        if (!StatusService.IsValidTransition(ticket.Status, "Assigned", "Admin", false))
        {
            return (false, "Invalid status transition. Can only assign 'New' tickets.");
        }

        string oldStatus = ticket.Status;
        ticket.Status = "Assigned";
        ticket.AssignedTechnicianId = technicianId;
        ticket.UpdatedAt = DateTime.UtcNow;

        // Log history
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = adminId,
            PreviousStatus = oldStatus,
            NewStatus = "Assigned",
            Comment = $"Assigned to technician ID {technicianId}.",
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketHistories.Add(history);
        await _context.SaveChangesAsync();

        return (true, "Ticket successfully assigned.");
    }

    // 3. Update Status (Technician or Reporter)
    public async Task<(bool Success, string Message)> UpdateStatusAsync(int ticketId, string newStatus, int userId, string userRole, string? comment = null)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null) return (false, "Ticket not found.");

        bool isAssignedTech = ticket.AssignedTechnicianId == userId;

        // Validate state machine rule
        if (!StatusService.IsValidTransition(ticket.Status, newStatus, userRole, isAssignedTech))
        {
            return (false, $"Illegal transition from '{ticket.Status}' to '{newStatus}' for role '{userRole}'.");
        }

        // If rejecting fix (Resolved -> In Progress), comment is required
        if (ticket.Status == "Resolved" && newStatus == "In Progress" && string.IsNullOrWhiteSpace(comment))
        {
            return (false, "A comment/reason is required when rejecting a fix.");
        }

        string oldStatus = ticket.Status;
        ticket.Status = newStatus;
        ticket.UpdatedAt = DateTime.UtcNow;

        // Log history
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = userId,
            PreviousStatus = oldStatus,
            NewStatus = newStatus,
            Comment = comment ?? $"Status changed from {oldStatus} to {newStatus}.",
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketHistories.Add(history);
        await _context.SaveChangesAsync();

        return (true, "Status updated successfully.");
    }
}