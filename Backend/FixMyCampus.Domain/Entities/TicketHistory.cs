// FixMyCampus.Domain/Entities/TicketHistory.cs
using FixMyCampus.Domain.Common;

namespace FixMyCampus.Domain.Entities;

public class TicketHistory : BaseEntity
{
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public int ChangedById { get; set; }
    public User ChangedBy { get; set; } = null!;

    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
}