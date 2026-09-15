using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] string refreshToken, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(refreshToken, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] string refreshToken, CancellationToken cancellationToken)
    {
        await _authService.RevokeRefreshTokenAsync(refreshToken, cancellationToken);
        return Ok(new { message = "Token revoked successfully." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.SendForgotPasswordOtpAsync(request, cancellationToken);
        return Ok(new { message = "Verification code sent if account exists." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResetPasswordAsync(request, cancellationToken);
            return Ok(new { message = "Password updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
