using System.ComponentModel.DataAnnotations;

namespace MeridianCredit.API.Models.DTOs.Requests;

public class LoginRequest
{
    [Required]
    public string EmailOrUsername { get; set; } = string.Empty;

    public string? Email { get; set; }

    [Required]
    public string Password { get; set; } = string.Empty;
}
