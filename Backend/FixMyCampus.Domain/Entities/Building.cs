using FixMyCampus.Domain.Common;

namespace FixMyCampus.Domain.Entities;

public class Building : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}