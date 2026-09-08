using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var userId))
        {
            return userId;
        }
        return 1; // Default fallback to first seeded user if unauthenticated in demo mode
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitApplication([FromBody] CreateApplicationRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var response = await _applicationService.SubmitApplicationAsync(userId, request, cancellationToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentApplication(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var response = await _applicationService.GetCurrentApplicationAsync(userId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("advance-stage")]
    public async Task<IActionResult> AdvanceStage([FromBody] AdvanceStageRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var response = await _applicationService.AdvanceStageAsync(userId, request, cancellationToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("upload-document")]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] string docType, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var fileName = await _applicationService.UploadDocumentAsync(userId, docType, file, cancellationToken);
            return Ok(new { fileName, docType, message = "Document uploaded successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
