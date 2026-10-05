using System.Security.Claims;
using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Auth;
using FixMyCampus.Application.DTOs.Tickets;
using FixMyCampus.Domain.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixMyCampus.WebApi.Controllers;

[ApiController]
[Route("api/v1/admin/tickets")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public AdminController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    private int GetCurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Command Center: Filter all campus tickets (Page 11 & 20)
    [HttpGet]
    public async Task<IActionResult> GetAllTickets([FromQuery] int? buildingId, [FromQuery] string? status, [FromQuery] string? category)
    {
        return Ok(await _ticketService.GetAllTicketsAdminAsync(buildingId, status, category));
    }

    // Technician Assignment (Page 11 & 20)
    [HttpPut("{id}/assign")]
    public async Task<IActionResult> AssignTechnician(int id, [FromBody] AssignTicketDto dto)
    {
        try
        {
            await _ticketService.AssignTechnicianAsync(id, GetCurrentUserId(), dto);
            return Ok(new { message = "Technician successfully assigned." });
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // Admin: Register a new technician
    [HttpPost("technicians")]
    public async Task<IActionResult> RegisterTechnician(
        [FromServices] IAuthService authService,
        [FromBody] RegisterTechnicianDto dto)
    {
        try
        {
            var result = await authService.RegisterTechnicianAsync(dto);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Admin: Get all technicians (for assignment dropdown)
    [HttpGet("technicians")]
    public async Task<IActionResult> GetTechnicians([FromServices] IAuthService authService)
    {
        return Ok(await authService.GetTechniciansAsync());
    }

    [HttpPost("register-admin")]
    public async Task<IActionResult> RegisterAdmin([FromServices] IAuthService authService, [FromBody] RegisterAdminDto dto)
    {
        try
        {
            var result = await authService.RegisterAdminAsync(dto);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}