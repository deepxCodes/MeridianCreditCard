using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly MeridianCreditDbContext _dbContext;

    public AuthController(
        IAuthService authService,
        MeridianCreditDbContext dbContext)
    {
        _authService = authService;
        _dbContext = dbContext;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(
                request,
                cancellationToken);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(
                request,
                cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(
        CancellationToken cancellationToken)
    {
        var idClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!int.TryParse(idClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid or missing identity claim."
            });
        }

        var user = await _dbContext.Users
            .AsNoTracking()
            .Include(u => u.MerchantProfile)
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "User account not found."
            });
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Username = user.Username,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            Address = user.Address,
            City = user.City,
            State = user.State,
            ZipCode = user.ZipCode,
            Role = user.Role,
            IsEmailVerified = user.IsEmailVerified,
            LastLoginAt = user.LastLoginAt,

            MerchantProfile = user.MerchantProfile == null
                ? null
                : new MerchantProfileDto
                {
                    Id = user.MerchantProfile.Id,
                    BusinessName = user.MerchantProfile.BusinessName,
                    BusinessCategory = user.MerchantProfile.BusinessCategory,
                    BusinessAddress = user.MerchantProfile.BusinessAddress,
                    GSTNumber = user.MerchantProfile.GSTNumber,
                    Website = user.MerchantProfile.Website
                }
        };

        return Ok(userDto);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest? request,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request?.RefreshToken))
        {
            await _authService.RevokeRefreshTokenAsync(
                request.RefreshToken,
                cancellationToken);
        }

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(
        [FromBody] string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(new
            {
                message = "Refresh token is required."
            });
        }

        try
        {
            var response = await _authService.RefreshTokenAsync(
                refreshToken,
                cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken(
        [FromBody] string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(new
            {
                message = "Refresh token is required."
            });
        }

        await _authService.RevokeRefreshTokenAsync(
            refreshToken,
            cancellationToken);

        return Ok(new
        {
            message = "Token revoked successfully."
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await _authService.SendForgotPasswordOtpAsync(
            request,
            cancellationToken);

        return Ok(new
        {
            message = "Verification code sent if account exists."
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResetPasswordAsync(
                request,
                cancellationToken);

            return Ok(new
            {
                message = "Password updated successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
