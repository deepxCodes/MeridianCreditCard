using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
    {
        var stats = await _adminService.GetDashboardStatsAsync(cancellationToken);
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _adminService.GetAllUsersAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("merchants")]
    public async Task<IActionResult> GetMerchants(CancellationToken cancellationToken)
    {
        var merchants = await _adminService.GetAllMerchantsAsync(cancellationToken);
        return Ok(merchants);
    }

    [HttpGet("fraud-logs")]
    public async Task<IActionResult> GetFraudLogs(CancellationToken cancellationToken)
    {
        var logs = await _adminService.GetFraudLogsAsync(cancellationToken);
        return Ok(logs);
    }

    [HttpPut("fraud-logs/{id:int}/resolve")]
    public async Task<IActionResult> ResolveFraudLog(int id, CancellationToken cancellationToken)
    {
        var adminName = User.FindFirstValue(ClaimTypes.Name) ?? "System Admin";
        try
        {
            await _adminService.ResolveFraudLogAsync(id, adminName, cancellationToken);
            return Ok(new { message = "Fraud log resolved successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications(CancellationToken cancellationToken)
    {
        var applications = await _adminService.GetAllApplicationsAsync(cancellationToken);
        return Ok(applications);
    }

    [HttpPut("applications/{id:int}/stage")]
    public async Task<IActionResult> UpdateApplicationStage(int id, [FromBody] MeridianCredit.API.Models.DTOs.Requests.AdvanceStageRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _adminService.UpdateApplicationStageAsync(id, request.TargetStage ?? 1, request.ForceReject, request.RejectionReason, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
