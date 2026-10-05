// FixMyCampus.Domain/Entities/Ticket.cs
using FixMyCampus.Domain.Common;

namespace FixMyCampus.Domain.Entities;

public class Ticket : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // "IT", "Plumbing", "Electrical", "Facility"
    public string Urgency { get; set; } = "Medium"; // "Low", "Medium", "Critical"
    public string Status { get; set; } = "New"; // "New", "Assigned", "In Progress", "Resolved", "Closed"

    // Location Logic: Either inside a Building/Room OR Outdoor Specific Location
    public int? BuildingId { get; set; }
    public Building? Building { get; set; }

    public int? RoomId { get; set; }
    public Room? Room { get; set; }

    public string? SpecificLocation { get; set; } // e.g., "Football Field Bleachers", "Main Courtyard"

    // Relations
    public int ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public int? AssignedTechnicianId { get; set; }
    public User? AssignedTechnician { get; set; }

    public ICollection<TicketHistory> Histories { get; set; } = new List<TicketHistory>();
}