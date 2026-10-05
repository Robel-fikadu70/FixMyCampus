using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.DTOs.Auth;
using FixMyCampus.Domain.Common.Interfaces;
using FixMyCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixMyCampus.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _context;
    private readonly IJwtProvider _jwtProvider;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IAppDbContext context, IJwtProvider jwtProvider, IPasswordHasher passwordHasher)
    {
        _context = context;
        _jwtProvider = jwtProvider;
        _passwordHasher = passwordHasher;
    }

    public async Task<(UserResponseDto User, string Token)> RegisterAsync(RegisterRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        {
            throw new ArgumentException("A user with this email already exists.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = "Reporter"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtProvider.GenerateToken(user);
        var userDto = new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };

        return (userDto, token);
    }

    public async Task<(UserResponseDto User, string Token)> LoginAsync(LoginRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var token = _jwtProvider.GenerateToken(user);
        var userDto = new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };

        return (userDto, token);
    }

    public async Task<UserResponseDto> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }
}