using System.Security.Claims;
using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Tickets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixMyCampus.WebApi.Controllers;

[ApiController]
[Route("api/v1/technician/tickets")]
[Authorize(Roles = "Technician")]
public class TechnicianController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TechnicianController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    private int GetCurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // My Assigned Tasks (Page 9 & 20)
    [HttpGet]
    public async Task<IActionResult> GetMyAssignedTasks()
    {
        return Ok(await _ticketService.GetAssignedTicketsAsync(GetCurrentUserId()));
    }

    // Status Progression: Assigned -> In Progress -> Resolved (Page 10 & 20)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        try
        {
            await _ticketService.UpdateTechnicianStatusAsync(id, GetCurrentUserId(), dto);
            return Ok(new { message = $"Ticket status updated to {dto.NewStatus}" });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}