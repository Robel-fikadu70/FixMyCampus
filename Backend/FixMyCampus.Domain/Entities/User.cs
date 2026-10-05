using FixMyCampus.Domain.Common;

namespace FixMyCampus.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Reporter"; // "Reporter", "Technician", "Admin"
    public string? Specialty { get; set; } // "IT", "Plumbing", etc.

    // Navigation properties
    public ICollection<Ticket> ReportedTickets { get; set; } = new List<Ticket>();
    public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
}