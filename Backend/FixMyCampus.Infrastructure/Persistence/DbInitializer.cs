using FixMyCampus.Domain.Common.Interfaces;
using FixMyCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixMyCampus.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher hasher)
    {
        // 1. Ensure Database is migrated
        await context.Database.MigrateAsync();

        // 2. Seed Default Admin if none exists
        if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
        {
            var defaultAdmin = new User
            {
                Name = "System Administrator",
                Email = "admin@campus.edu",
                PasswordHash = hasher.HashPassword("Admin@123"), // Default admin password
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(defaultAdmin);
            await context.SaveChangesAsync();
        }

        // 3. Seed Initial Buildings & Rooms if empty
        if (!await context.Buildings.AnyAsync())
        {
            var stBuilding = new Building { Name = "Science & Technology Building", Code = "STB" };
            var engBuilding = new Building { Name = "Engineering Building", Code = "ENG" };
            var libBuilding = new Building { Name = "Main Library", Code = "LIB" };

            context.Buildings.AddRange(stBuilding, engBuilding, libBuilding);
            await context.SaveChangesAsync();

            context.Rooms.AddRange(
                new Room { BuildingId = stBuilding.Id, RoomNumber = "Room 404" },
                new Room { BuildingId = stBuilding.Id, RoomNumber = "Room 101" },
                new Room { BuildingId = engBuilding.Id, RoomNumber = "Room 201" },
                new Room { BuildingId = libBuilding.Id, RoomNumber = "Room 12" }
            );

            await context.SaveChangesAsync();
        }
    }
}