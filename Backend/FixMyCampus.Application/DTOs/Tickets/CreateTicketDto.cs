namespace FixMyCampus.Application.DTOs.Tickets;

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // "IT", "Plumbing", "Electrical", "Facility"
    public string Urgency { get; set; } = "Medium";      // "Low", "Medium", "Critical"

    // Can belong to a building/room OR be outdoors (specific location)
    public int? BuildingId { get; set; }
    public int? RoomId { get; set; }
    public string? SpecificLocation { get; set; } // e.g., "Sports Field Bleachers"
}

public class TicketResponseDto
{
    public int Id { get; set; }
    public string TicketNumber => $"#FC-{1000 + Id}";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public int? BuildingId { get; set; }
    public string? BuildingName { get; set; }
    public int? RoomId { get; set; }
    public string? RoomNumber { get; set; }
    public string? SpecificLocation { get; set; }

    public int ReporterId { get; set; }
    public string ReporterName { get; set; } = string.Empty;

    public int? AssignedTechnicianId { get; set; }
    public string? AssignedTechnicianName { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class TicketHistoryDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string ChangedByName { get; set; } = string.Empty;
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime Timestamp { get; set; }
}

public class AssignTicketDto
{
    public int TechnicianId { get; set; }
}

public class ChangeStatusDto
{
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
}

public class RejectFixDto
{
    public string Comment { get; set; } = string.Empty; // Compulsory per requirements
}