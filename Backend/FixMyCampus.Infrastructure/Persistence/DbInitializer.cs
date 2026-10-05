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
                PasswordHash = hasher.HashPassword("Admin@123!"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(defaultAdmin);
            await context.SaveChangesAsync();
        }

        // 3. Seed Technicians if none exist
        if (!await context.Users.AnyAsync(u => u.Role == "Technician"))
        {
            var tech1 = new User
            {
                Name = "Abel Tech",
                Email = "abel.tech@campus.edu",
                PasswordHash = hasher.HashPassword("Password123!"),
                Role = "Technician",
                Specialty = "IT",
                CreatedAt = DateTime.UtcNow
            };

            var tech2 = new User
            {
                Name = "Sara Maintenance",
                Email = "sara.m@campus.edu",
                PasswordHash = hasher.HashPassword("Password123!"),
                Role = "Technician",
                Specialty = "Plumbing",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(tech1, tech2);
            await context.SaveChangesAsync();
        }

        // 4. Seed a Test Reporter if none exists
        var reporter = await context.Users.FirstOrDefaultAsync(u => u.Email == "isaac@campus.edu");
        if (reporter == null)
        {
            reporter = new User
            {
                Name = "Isaac Newton",
                Email = "isaac@campus.edu",
                PasswordHash = hasher.HashPassword("Password123!"),
                Role = "Reporter",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(reporter);
            await context.SaveChangesAsync();
        }

        // 5. Seed Buildings safely
        var stBuilding = await context.Buildings.FirstOrDefaultAsync(b => b.Code == "STB");
        if (stBuilding == null)
        {
            stBuilding = new Building { Name = "Science & Technology Building", Code = "STB" };
            context.Buildings.Add(stBuilding);
        }

        var engBuilding = await context.Buildings.FirstOrDefaultAsync(b => b.Code == "ENG");
        if (engBuilding == null)
        {
            engBuilding = new Building { Name = "Engineering Building", Code = "ENG" };
            context.Buildings.Add(engBuilding);
        }

        var libBuilding = await context.Buildings.FirstOrDefaultAsync(b => b.Code == "LIB");
        if (libBuilding == null)
        {
            libBuilding = new Building { Name = "Main Library", Code = "LIB" };
            context.Buildings.Add(libBuilding);
        }

        await context.SaveChangesAsync();

        // 6. Seed Rooms safely using FirstOrDefault
        var room404 = await context.Rooms.FirstOrDefaultAsync(r => r.RoomNumber == "Room 404");
        if (room404 == null)
        {
            room404 = new Room { BuildingId = stBuilding.Id, RoomNumber = "Room 404" };
            context.Rooms.Add(room404);
        }

        var lab201 = await context.Rooms.FirstOrDefaultAsync(r => r.RoomNumber == "Lab 201");
        if (lab201 == null)
        {
            lab201 = new Room { BuildingId = stBuilding.Id, RoomNumber = "Lab 201" };
            context.Rooms.Add(lab201);
        }

        if (!await context.Rooms.AnyAsync(r => r.RoomNumber == "Workshop 10"))
        {
            context.Rooms.Add(new Room { BuildingId = engBuilding.Id, RoomNumber = "Workshop 10" });
        }

        if (!await context.Rooms.AnyAsync(r => r.RoomNumber == "Reading Hall A"))
        {
            context.Rooms.Add(new Room { BuildingId = libBuilding.Id, RoomNumber = "Reading Hall A" });
        }

        await context.SaveChangesAsync();

        var abelTech = await context.Users.FirstAsync(u => u.Email == "abel.tech@campus.edu");

        // 7. Seed Sample Tickets if empty
        if (!await context.Tickets.AnyAsync())
        {
            var ticket1 = new Ticket
            {
                
                Title = "Wi-Fi not working",
                Description = "The computers in Room 404 cannot connect to the campus Wi-Fi network.",
                Category = "IT",
                Urgency = "Medium",
                Status = "In Progress",
                BuildingId = stBuilding.Id,
                RoomId = room404.Id,
                SpecificLocation = null,
                ReporterId = reporter.Id,
                AssignedTechnicianId = abelTech.Id,
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-1)
            };

            var ticket2 = new Ticket
            {
                
                Title = "Projector bulb burnt out",
                Description = "The projector in Lab 201 flashes red and turns off immediately.",
                Category = "IT",
                Urgency = "High",
                Status = "New",
                BuildingId = stBuilding.Id,
                RoomId = lab201.Id,
                SpecificLocation = null,
                ReporterId = reporter.Id,
                AssignedTechnicianId = null,
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            };

            var ticket3 = new Ticket
            {
                
                Title = "Broken sprinkler head",
                Description = "Outdoor sprinkler is spraying water directly onto the walkway near the entrance.",
                Category = "Plumbing",
                Urgency = "Critical",
                Status = "New",
                BuildingId = null,
                RoomId = null,
                SpecificLocation = "Engineering Building North Lawn",
                ReporterId = reporter.Id,
                AssignedTechnicianId = null,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30)
            };

            context.Tickets.AddRange(ticket1, ticket2, ticket3);
            await context.SaveChangesAsync();
        }
    }
}