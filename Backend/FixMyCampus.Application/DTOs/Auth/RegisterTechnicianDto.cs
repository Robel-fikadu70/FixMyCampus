namespace FixMyCampus.Application.DTOs.Auth;

public class RegisterTechnicianDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Specialty { get; set; } // "IT", "Electrical", "Plumbing", etc.
}