using FixMyCampus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FixMyCampus.WebApi.Controllers;

[ApiController]
[Route("api/v1/buildings")]
public class BuildingsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public BuildingsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBuildings()
    {
        return Ok(await _lookupService.GetBuildingsAsync());
    }

    [HttpGet("{id}/rooms")]
    public async Task<IActionResult> GetRooms(int id)
    {
        return Ok(await _lookupService.GetRoomsByBuildingIdAsync(id));
    }
}