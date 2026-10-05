using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Tickets;
using FixMyCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixMyCampus.Application.Services;

public class TicketService : ITicketService
{
    private readonly IAppDbContext _context;

    public TicketService(IAppDbContext context)
    {
        _context = context;
    }
    public async Task<TicketResponseDto> CreateTicketAsync(int reporterId, CreateTicketDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Description) || string.IsNullOrWhiteSpace(dto.Category))
        {
            throw new ArgumentException("Title, Description, and Category are required.");
        }

        // Location check
        if (!dto.BuildingId.HasValue && string.IsNullOrWhiteSpace(dto.SpecificLocation))
        {
            throw new ArgumentException("Must provide either a Building or a Specific Location (e.g. Football Field).");
        }

        // Validate Building exists if provided
        if (dto.BuildingId.HasValue)
        {
            var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == dto.BuildingId.Value);
            if (!buildingExists)
            {
                throw new ArgumentException($"Building with ID {dto.BuildingId.Value} does not exist.");
            }

            // Validate Room exists and belongs to that Building if provided
            if (dto.RoomId.HasValue)
            {
                var roomExists = await _context.Rooms.AnyAsync(r => r.Id == dto.RoomId.Value && r.BuildingId == dto.BuildingId.Value);
                if (!roomExists)
                {
                    throw new ArgumentException($"Room with ID {dto.RoomId.Value} does not exist in Building {dto.BuildingId.Value}.");
                }
            }
        }

        var ticket = new Ticket
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            Urgency = string.IsNullOrWhiteSpace(dto.Urgency) ? "Medium" : dto.Urgency,
            Status = "New",
            BuildingId = dto.BuildingId,
            RoomId = dto.RoomId,
            SpecificLocation = dto.SpecificLocation?.Trim(),
            ReporterId = reporterId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = reporterId,
            PreviousStatus = "None",
            NewStatus = "New",
            Comment = "Ticket created by reporter.",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return await GetTicketByIdAsync(ticket.Id);
    }
    public async Task<List<TicketResponseDto>> GetMyTicketsAsync(int reporterId)
    {
        return await MapToDtoQuery(_context.Tickets.Where(t => t.ReporterId == reporterId)).ToListAsync();
    }

    public async Task ConfirmFixAsync(int ticketId, int reporterId)
    {
        var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException("Ticket not found.");
        if (ticket.ReporterId != reporterId) throw new UnauthorizedAccessException("You can only confirm fixes for your own tickets.");

        if (ticket.Status != "Resolved")
        {
            throw new InvalidOperationException("Invalid ticket status transition. Only 'Resolved' tickets can be closed.");
        }

        ticket.Status = "Closed";
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = reporterId,
            PreviousStatus = "Resolved",
            NewStatus = "Closed",
            Comment = "Reporter confirmed fix.",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task RejectFixAsync(int ticketId, int reporterId, RejectFixDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Comment))
        {
            throw new ArgumentException("A comment explaining why the fix is rejected is required.");
        }

        var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException("Ticket not found.");
        if (ticket.ReporterId != reporterId) throw new UnauthorizedAccessException("You can only reject fixes for your own tickets.");

        if (ticket.Status != "Resolved")
        {
            throw new InvalidOperationException("Invalid ticket status transition. Only 'Resolved' tickets can be rejected.");
        }

        ticket.Status = "In Progress";
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = reporterId,
            PreviousStatus = "Resolved",
            NewStatus = "In Progress",
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task<List<TicketResponseDto>> GetAssignedTicketsAsync(int technicianId)
    {
        return await MapToDtoQuery(_context.Tickets.Where(t => t.AssignedTechnicianId == technicianId)).ToListAsync();
    }

    public async Task UpdateTechnicianStatusAsync(int ticketId, int technicianId, ChangeStatusDto dto)
    {
        var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException("Ticket not found.");
        if (ticket.AssignedTechnicianId != technicianId) throw new UnauthorizedAccessException("You are not assigned to this ticket.");

        // Strict State machine logic for Technician:
        // Assigned -> In Progress
        // In Progress -> Resolved
        if (ticket.Status == "Assigned" && dto.NewStatus == "In Progress")
        {
            ticket.Status = "In Progress";
        }
        else if (ticket.Status == "In Progress" && dto.NewStatus == "Resolved")
        {
            ticket.Status = "Resolved";
        }
        else
        {
            throw new InvalidOperationException($"Invalid ticket status transition from {ticket.Status} to {dto.NewStatus}.");
        }

        ticket.UpdatedAt = DateTime.UtcNow;

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = technicianId,
            PreviousStatus = ticket.Status == "In Progress" ? "Assigned" : "In Progress",
            NewStatus = dto.NewStatus,
            Comment = dto.Comment ?? $"Technician moved status to {dto.NewStatus}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task<List<TicketResponseDto>> GetAllTicketsAdminAsync(int? buildingId, string? status, string? category)
    {
        return await FilterTickets(buildingId, status, category);
    }

    public async Task AssignTechnicianAsync(int ticketId, int adminId, AssignTicketDto dto)
    {
        var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) throw new KeyNotFoundException("Ticket not found.");

        var technician = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.TechnicianId && u.Role == "Technician");
        if (technician == null) throw new ArgumentException("Assigned user is not a valid technician.");

        var prevStatus = ticket.Status;
        ticket.AssignedTechnicianId = technician.Id;
        ticket.Status = "Assigned"; // Spec: Assignment automatically moves ticket to Assigned
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            ChangedById = adminId,
            PreviousStatus = prevStatus,
            NewStatus = "Assigned",
            Comment = $"Assigned to technician {technician.Name}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task<List<TicketResponseDto>> GetCampusFeedAsync(int? buildingId, string? status, string? category)
    {
        return await FilterTickets(buildingId, status, category);
    }

    public async Task<TicketResponseDto> GetTicketByIdAsync(int ticketId)
    {
        var dto = await MapToDtoQuery(_context.Tickets.Where(t => t.Id == ticketId)).FirstOrDefaultAsync();
        if (dto == null) throw new KeyNotFoundException("Ticket not found.");
        return dto;
    }

    public async Task<List<TicketHistoryDto>> GetTicketHistoryAsync(int ticketId)
    {
        return await _context.TicketHistories
            .Where(h => h.TicketId == ticketId)
            .OrderBy(h => h.CreatedAt)
            .Select(h => new TicketHistoryDto
            {
                Id = h.Id,
                TicketId = h.TicketId,
                ChangedByName = h.ChangedBy.Name,
                PreviousStatus = h.PreviousStatus,
                NewStatus = h.NewStatus,
                Comment = h.Comment,
                Timestamp = h.CreatedAt
            })
            .ToListAsync();
    }

    private async Task<List<TicketResponseDto>> FilterTickets(int? buildingId, string? status, string? category)
    {
        var query = _context.Tickets.AsQueryable();

        if (buildingId.HasValue)
            query = query.Where(t => t.BuildingId == buildingId.Value);

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
            query = query.Where(t => t.Status.ToLower() == status.ToLower());

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
            query = query.Where(t => t.Category.ToLower() == category.ToLower());

        return await MapToDtoQuery(query.OrderByDescending(t => t.CreatedAt)).ToListAsync();
    }

    private IQueryable<TicketResponseDto> MapToDtoQuery(IQueryable<Ticket> query)
    {
        return query.Select(t => new TicketResponseDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Category = t.Category,
            Urgency = t.Urgency,
            Status = t.Status,
            BuildingId = t.BuildingId,
            BuildingName = t.Building != null ? t.Building.Name : null,
            RoomId = t.RoomId,
            RoomNumber = t.Room != null ? t.Room.RoomNumber : null,
            SpecificLocation = t.SpecificLocation,
            ReporterId = t.ReporterId,
            ReporterName = t.Reporter.Name,
            AssignedTechnicianId = t.AssignedTechnicianId,
            AssignedTechnicianName = t.AssignedTechnician != null ? t.AssignedTechnician.Name : null,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        });
    }
}