using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Lookups;
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
}