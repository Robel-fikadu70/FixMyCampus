using FixMyCampus.Application.DTOs.Auth;

namespace FixMyCampus.Domain.Common.Interfaces;

public interface IAuthService
{
    Task<(UserResponseDto User, string Token)> RegisterAsync(RegisterRequestDto request);
    Task<(UserResponseDto User, string Token)> LoginAsync(LoginRequestDto request);
    Task<UserResponseDto> GetCurrentUserAsync(int userId);
}