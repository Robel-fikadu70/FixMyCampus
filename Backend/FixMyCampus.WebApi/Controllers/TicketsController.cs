using System.Security.Claims;
using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Tickets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixMyCampus.WebApi.Controllers;

[ApiController]
[Route("api/v1/tickets")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    private int GetCurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Read-only Campus Feed (Page 6 & 20)
    [HttpGet]
    public async Task<IActionResult> GetCampusFeed([FromQuery] int? buildingId, [FromQuery] string? status, [FromQuery] string? category)
    {
        return Ok(await _ticketService.GetCampusFeedAsync(buildingId, status, category));
    }

    // Reporter: My Tickets (Page 5 & 20)
    [Authorize(Roles = "Reporter")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyTickets()
    {
        return Ok(await _ticketService.GetMyTicketsAsync(GetCurrentUserId()));
    }

    // Ticket Details (Page 7 & 20)
    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(await _ticketService.GetTicketByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Ticket not found." }); }
    }

    // Ticket Audit History (Page 14 & 20)
    [Authorize]
    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        return Ok(await _ticketService.GetTicketHistoryAsync(id));
    }

    // Reporter: Create Ticket (Page 4, 5 & 20)
    [Authorize(Roles = "Reporter")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketDto dto)
    {
        try { return Ok(await _ticketService.CreateTicketAsync(GetCurrentUserId(), dto)); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // Feedback Loop: Confirm Fix (Page 8 & 21)
    [Authorize(Roles = "Reporter")]
    [HttpPut("{id}/confirm-fix")]
    public async Task<IActionResult> ConfirmFix(int id)
    {
        try
        {
            await _ticketService.ConfirmFixAsync(id, GetCurrentUserId());
            return Ok(new { message = "Ticket marked as Closed." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // Feedback Loop: Reject Fix (Page 8 & 21)
    [Authorize(Roles = "Reporter")]
    [HttpPut("{id}/reject-fix")]
    public async Task<IActionResult> RejectFix(int id, [FromBody] RejectFixDto dto)
    {
        try
        {
            await _ticketService.RejectFixAsync(id, GetCurrentUserId(), dto);
            return Ok(new { message = "Ticket returned to In Progress." });
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}