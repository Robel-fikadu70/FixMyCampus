using FixMyCampus.Domain.Entities;

namespace FixMyCampus.Application.Common.Interfaces;

public interface IStatusService
{
    void ValidateTransition(Ticket ticket, string newStatus, User actor);
    Task ApplyTransitionAsync(Ticket ticket, string newStatus, User actor, string? comment = null);
}