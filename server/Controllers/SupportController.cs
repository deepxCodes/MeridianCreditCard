using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportController : ControllerBase
{
    private readonly MeridianCreditDbContext _dbContext;

    public SupportController(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private int? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SubmitSupportMessage([FromBody] SupportMessageRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Please complete both subject and message fields." });
        }

        var userId = GetCurrentUserId();

        var ticket = new SupportTicket
        {
            UserId = userId,
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.SupportTickets.AddAsync(ticket, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Message sent to support — we will respond within one business day." });
    }
}
