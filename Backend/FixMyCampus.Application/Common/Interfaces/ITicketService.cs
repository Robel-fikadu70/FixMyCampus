using FixMyCampus.Application.DTOs.Tickets;

namespace FixMyCampus.Application.Common.Interfaces;

public interface ITicketService
{
    // Reporter
    Task<TicketResponseDto> CreateTicketAsync(int reporterId, CreateTicketDto dto);
    Task<List<TicketResponseDto>> GetMyTicketsAsync(int reporterId);
    Task ConfirmFixAsync(int ticketId, int reporterId);
    Task RejectFixAsync(int ticketId, int reporterId, RejectFixDto dto);

    // Technician
    Task<List<TicketResponseDto>> GetAssignedTicketsAsync(int technicianId);
    Task UpdateTechnicianStatusAsync(int ticketId, int technicianId, ChangeStatusDto dto);

    // Admin
    Task<List<TicketResponseDto>> GetAllTicketsAdminAsync(int? buildingId, string? status, string? category);
    Task AssignTechnicianAsync(int ticketId, int adminId, AssignTicketDto dto);

    // Shared / Feed
    Task<List<TicketResponseDto>> GetCampusFeedAsync(int? buildingId, string? status, string? category);
    Task<TicketResponseDto> GetTicketByIdAsync(int ticketId);
    Task<List<TicketHistoryDto>> GetTicketHistoryAsync(int ticketId);
}