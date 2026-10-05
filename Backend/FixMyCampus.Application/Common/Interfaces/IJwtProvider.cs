using FixMyCampus.Domain.Entities;

namespace FixMyCampus.Domain.Common.Interfaces;

public interface IJwtProvider
{
string GenerateToken(User user);
}