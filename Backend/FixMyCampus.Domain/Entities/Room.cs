using FixMyCampus.Domain.Common;

namespace FixMyCampus.Domain.Entities;

public class Room : BaseEntity
{
    public int BuildingId { get; set; }
    public Building Building { get; set; } = null!;
    public string RoomNumber { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}