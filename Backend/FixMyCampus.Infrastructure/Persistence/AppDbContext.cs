using Microsoft.EntityFrameworkCore;
using FixMyCampus.Domain.Entities;
using FixMyCampus.Application.Common.Interfaces; 
namespace FixMyCampus.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketHistory> TicketHistories => Set<TicketHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Relationships
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Reporter)
            .WithMany(u => u.ReportedTickets)
            .HasForeignKey(t => t.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedTechnician)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedTechnicianId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Building)
            .WithMany(b => b.Tickets)
            .HasForeignKey(t => t.BuildingId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Room)
            .WithMany(r => r.Tickets)
            .HasForeignKey(t => t.RoomId)
            .OnDelete(DeleteBehavior.SetNull);

        // Apply Global Query Filters for Soft Delete (.IsDeleted == false)
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Building>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Room>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Ticket>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<TicketHistory>().HasQueryFilter(e => !e.IsDeleted);
    }
}