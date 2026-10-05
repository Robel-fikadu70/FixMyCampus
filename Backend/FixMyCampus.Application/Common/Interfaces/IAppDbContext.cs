using Microsoft.EntityFrameworkCore;
using FixMyCampus.Domain.Entities;

namespace FixMyCampus.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Building> Buildings { get; }
    DbSet<Room> Rooms { get; }
    DbSet<Ticket> Tickets { get; }
    DbSet<TicketHistory> TicketHistories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}