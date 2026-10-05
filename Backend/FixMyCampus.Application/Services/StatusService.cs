using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Domain.Entities;

namespace FixMyCampus.Application.Services;

public class StatusService : IStatusService
{
    private readonly IAppDbContext _context;

    public StatusService(IAppDbContext context)
    {
        _context = context;
    }

    public void ValidateTransition(Ticket ticket, string newStatus, User actor)
    {
        var current = ticket.Status;

        // Rule 1: Admin assigns technician -> New to Assigned
        if (current == "New" && newStatus == "Assigned")
        {
            if (actor.Role != "Admin")
                throw new UnauthorizedAccessException("Only Admins can assign tickets.");
            return;
        }

        // Rule 2: Technician starts work -> Assigned to In Progress
        if (current == "Assigned" && newStatus == "In Progress")
        {
            if (actor.Role != "Technician" || ticket.AssignedTechnicianId != actor.Id)
                throw new UnauthorizedAccessException("Only the assigned technician can start work on this ticket.");
            return;
        }

        // Rule 3: Technician finishes work -> In Progress to Resolved
        if (current == "In Progress" && newStatus == "Resolved")
        {
            if (actor.Role != "Technician" || ticket.AssignedTechnicianId != actor.Id)
                throw new UnauthorizedAccessException("Only the assigned technician can resolve this ticket.");
            return;
        }

        // Rule 4: Feedback Loop - Reporter confirms fix -> Resolved to Closed
        if (current == "Resolved" && newStatus == "Closed")
        {
            if (ticket.ReporterId != actor.Id)
                throw new UnauthorizedAccessException("Only the original reporter can confirm the fix.");
            return;
        }

        // Rule 5: Feedback Loop - Reporter rejects fix -> Resolved to In Progress
        if (current == "Resolved" && newStatus == "In Progress")
        {
            if (ticket.ReporterId != actor.Id)
                throw new UnauthorizedAccessException("Only the original reporter can reject the fix.");
            return;
        }

        // ANY other transition is ILLEGAL (New -> Resolved, Assigned -> Resolved, Closed -> New, etc.)
        throw new InvalidOperationException("Invalid ticket status transition.");
    }

    public async Task ApplyTransitionAsync(Ticket ticket, string newStatus, User actor, string? comment = null)
    {
        ValidateTransition(ticket, newStatus, actor);

        var prevStatus = ticket.Status;
        ticket.Status = newStatus;
        ticket.UpdatedAt = DateTime.UtcNow;

        // Automatically log audit timeline entry
        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = actor.Id,
            PreviousStatus = prevStatus,
            NewStatus = newStatus,
            Comment = comment ?? $"Status moved from {prevStatus} to {newStatus}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }
}