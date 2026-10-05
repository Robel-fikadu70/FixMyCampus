using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Lookups;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixMyCampus.WebApi.Controllers;

[ApiController]
[Route("api/buildings")]
public class BuildingsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public BuildingsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    // Public / Shared Lookups
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

    // Admin Only: Register new Building
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateBuilding([FromBody] CreateBuildingDto dto)
    {
        try
        {
            var result = await _lookupService.CreateBuildingAsync(dto);
            return CreatedAtAction(nameof(GetBuildings), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Admin Only: Register new Room under a Building
    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/rooms")]
    public async Task<IActionResult> CreateRoom(int id, [FromBody] CreateRoomDto dto)
    {
        try
        {
            var result = await _lookupService.CreateRoomAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}