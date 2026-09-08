using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly MeridianCreditDbContext _dbContext;

    public UserController(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var userId))
        {
            return userId;
        }
        return 1;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
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
            LastLoginAt = user.LastLoginAt
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
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

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
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
        var notif = await _dbContext.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);
        if (notif != null)
        {
            notif.IsRead = true;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        return Ok(new { message = "Notification marked as read." });
    }
}
