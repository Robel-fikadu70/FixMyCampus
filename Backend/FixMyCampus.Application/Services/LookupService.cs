using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Lookups;
using FixMyCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixMyCampus.Application.Services;

public class LookupService : ILookupService
{
    private readonly IAppDbContext _context;

    public LookupService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BuildingDto>> GetBuildingsAsync()
    {
        return await _context.Buildings
            .Select(b => new BuildingDto { Id = b.Id, Name = b.Name, Code = b.Code })
            .ToListAsync();
    }

    public async Task<List<RoomDto>> GetRoomsByBuildingIdAsync(int buildingId)
    {
        return await _context.Rooms
            .Where(r => r.BuildingId == buildingId)
            .Select(r => new RoomDto { Id = r.Id, BuildingId = r.BuildingId, RoomNumber = r.RoomNumber })
            .ToListAsync();
    }

    public async Task<BuildingDto> CreateBuildingAsync(CreateBuildingDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Code))
            throw new ArgumentException("Building Name and Code are required.");

        var building = new Building
        {
            Name = dto.Name.Trim(),
            Code = dto.Code.Trim().ToUpperInvariant()
        };

        _context.Buildings.Add(building);
        await _context.SaveChangesAsync();

        return new BuildingDto { Id = building.Id, Name = building.Name, Code = building.Code };
    }

    public async Task<RoomDto> CreateRoomAsync(int buildingId, CreateRoomDto dto)
    {
        var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == buildingId);
        if (!buildingExists)
            throw new KeyNotFoundException($"Building with ID {buildingId} does not exist.");

        if (string.IsNullOrWhiteSpace(dto.RoomNumber))
            throw new ArgumentException("Room number is required.");

        var room = new Room
        {
            BuildingId = buildingId,
            RoomNumber = dto.RoomNumber.Trim()
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        return new RoomDto { Id = room.Id, BuildingId = room.BuildingId, RoomNumber = room.RoomNumber };
    }
}