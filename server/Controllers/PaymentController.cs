using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.ServicesInternal.PaymentGateway;

namespace MeridianCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentGatewayService _paymentGatewayService;

    public PaymentController(IPaymentGatewayService paymentGatewayService)
    {
        _paymentGatewayService = paymentGatewayService;
    }

    [Authorize]
    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request, CancellationToken cancellationToken)
    {
        // Enforce that customer can only initiate payment for their own CustomerId unless Admin
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);

        if (roleClaim != "Admin" && int.TryParse(userIdClaim, out var currentUserId) && currentUserId != request.CustomerId)
        {
            return Forbid();
        }

        var response = await _paymentGatewayService.ProcessPaymentAsync(request, cancellationToken);
        return Ok(response);
    }
}
