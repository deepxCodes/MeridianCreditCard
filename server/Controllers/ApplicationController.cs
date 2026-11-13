using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ApplicationController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    /// <summary>
    /// Returns the authenticated user's ID from claims.
    /// Returns 0 if claims are absent (callers must check and return Unauthorized).
    /// </summary>
    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub")
                      ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return int.TryParse(idClaim, out var userId) ? userId : 0;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitApplication([FromBody] CreateApplicationRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        try
        {
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
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        var response = await _applicationService.GetCurrentApplicationAsync(userId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("advance-stage")]
    public async Task<IActionResult> AdvanceStage([FromBody] AdvanceStageRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        try
        {
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
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Not authenticated." });

        try
        {
            var fileName = await _applicationService.UploadDocumentAsync(userId, docType, file, cancellationToken);
            return Ok(new { fileName, docType, message = "Document uploaded successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
