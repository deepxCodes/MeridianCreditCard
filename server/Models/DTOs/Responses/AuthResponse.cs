using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.DTOs.Responses;

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Username { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public UserRole Role { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public MerchantProfileDto? MerchantProfile { get; set; }
}

public class MerchantProfileDto
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessCategory { get; set; } = string.Empty;
    public string? BusinessAddress { get; set; }
    public string? GSTNumber { get; set; }
    public string? Website { get; set; }
}
