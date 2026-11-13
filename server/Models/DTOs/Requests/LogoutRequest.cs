namespace MeridianCredit.API.Models.DTOs.Requests;

/// <summary>
/// Request body for POST /api/auth/logout.
/// The RefreshToken field is optional — if provided, the server revokes it.
/// </summary>
public class LogoutRequest
{
    public string? RefreshToken { get; set; }
}
