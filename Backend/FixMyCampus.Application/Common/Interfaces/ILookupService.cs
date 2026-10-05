using FixMyCampus.Application.DTOs.Lookups;

namespace FixMyCampus.Application.Common.Interfaces;

public interface ILookupService
{
    Task<List<BuildingDto>> GetBuildingsAsync();
    Task<List<RoomDto>> GetRoomsByBuildingIdAsync(int buildingId);
}