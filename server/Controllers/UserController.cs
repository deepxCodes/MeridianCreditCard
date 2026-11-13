using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly MeridianCreditDbContext _dbContext;

    public UserController(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Returns the authenticated user's ID from claims, or 0 if claims are absent.
    /// Callers must check for 0 and return Unauthorized().
    /// </summary>
    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idClaim, out var userId) ? userId : 0;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        var user = await _dbContext.Users
            .Include(u => u.MerchantProfile)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new UserDto
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
            MerchantProfile = user.MerchantProfile == null ? null : new MerchantProfileDto
            {
                Id = user.MerchantProfile.Id,
                BusinessName = user.MerchantProfile.BusinessName,
                BusinessCategory = user.MerchantProfile.BusinessCategory,
                BusinessAddress = user.MerchantProfile.BusinessAddress,
                GSTNumber = user.MerchantProfile.GSTNumber,
                Website = user.MerchantProfile.Website
            }
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email)) user.Email = request.Email.Trim();
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber.Trim();
        if (!string.IsNullOrWhiteSpace(request.Address)) user.Address = request.Address.Trim();
        if (!string.IsNullOrWhiteSpace(request.City)) user.City = request.City.Trim();
        if (!string.IsNullOrWhiteSpace(request.State)) user.State = request.State.Trim();
        if (!string.IsNullOrWhiteSpace(request.ZipCode)) user.ZipCode = request.ZipCode.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Profile updated successfully." });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Password updated successfully." });
    }

    /// <summary>
    /// Registers (or updates) the current customer's merchant profile in SQL Server.
    /// Returns an updated UserDto (with MerchantProfile) so the client can refresh its state immediately.
    /// </summary>
    [HttpPost("register-merchant")]
    public async Task<IActionResult> RegisterMerchant([FromBody] RegisterMerchantRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });
        var user = await _dbContext.Users
            .Include(u => u.MerchantProfile)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null) return NotFound(new { message = "User not found." });

        if (user.MerchantProfile == null)
        {
            // Create a new merchant profile linked to this user
            var profile = new MerchantProfile
            {
                UserId = userId,
                BusinessName = request.BusinessName.Trim(),
                BusinessCategory = request.BusinessCategory.Trim(),
                BusinessAddress = request.BusinessAddress?.Trim(),
                GSTNumber = request.GSTNumber?.Trim(),
                Website = request.Website?.Trim()
            };
            await _dbContext.MerchantProfiles.AddAsync(profile, cancellationToken);
            user.MerchantProfile = profile;
        }
        else
        {
            // Update existing profile
            user.MerchantProfile.BusinessName = request.BusinessName.Trim();
            user.MerchantProfile.BusinessCategory = request.BusinessCategory.Trim();
            user.MerchantProfile.BusinessAddress = request.BusinessAddress?.Trim();
            user.MerchantProfile.GSTNumber = request.GSTNumber?.Trim();
            user.MerchantProfile.Website = request.Website?.Trim();
        }

        // Add a welcome notification for the merchant registration
        var notif = new Notification
        {
            UserId = userId,
            Subject = $"Merchant account activated",
            Message = $"Your merchant business '{request.BusinessName.Trim()}' has been registered successfully. You can now access the Merchant Portal.",
            NotificationType = NotificationType.General,
            IsRead = false
        };
        await _dbContext.Notifications.AddAsync(notif, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Merchant profile registered successfully.",
            merchantProfile = new MerchantProfileDto
            {
                Id = user.MerchantProfile.Id,
                BusinessName = user.MerchantProfile.BusinessName,
                BusinessCategory = user.MerchantProfile.BusinessCategory,
                BusinessAddress = user.MerchantProfile.BusinessAddress,
                GSTNumber = user.MerchantProfile.GSTNumber,
                Website = user.MerchantProfile.Website
            },
            user = new UserDto
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
                MerchantProfile = new MerchantProfileDto
                {
                    Id = user.MerchantProfile.Id,
                    BusinessName = user.MerchantProfile.BusinessName,
                    BusinessCategory = user.MerchantProfile.BusinessCategory,
                    BusinessAddress = user.MerchantProfile.BusinessAddress,
                    GSTNumber = user.MerchantProfile.GSTNumber,
                    Website = user.MerchantProfile.Website
                }
            }
        });
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });
        var notifications = await _dbContext.Notifications
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(20)
            .Select(n => new
            {
                n.Id,
                n.Title,
                Body = n.Message,
                Time = n.CreatedAt.ToString("MMM dd, yyyy HH:mm"),
                n.IsRead
            })
            .ToListAsync(cancellationToken);

        return Ok(notifications);
    }

    [HttpPatch("notifications/{id}/read")]
    public async Task<IActionResult> MarkNotificationRead(int id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });
        var notif = await _dbContext.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);
        if (notif != null)
        {
            notif.IsRead = true;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        return Ok(new { message = "Notification marked as read." });
    }
}
