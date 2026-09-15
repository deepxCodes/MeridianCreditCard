using System.ComponentModel.DataAnnotations;
using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.DTOs.Requests;

public class RegisterRequest
{
    [Required]
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Username { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    public UserRole Role { get; set; } = UserRole.Customer;

    // Optional Merchant Details if Role == Merchant
    public string? BusinessName { get; set; }
    public string? BusinessCategory { get; set; }
    public string? BusinessAddress { get; set; }
    public string? GSTNumber { get; set; }
    public string? Website { get; set; }
}
