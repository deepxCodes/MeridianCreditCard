using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Middleware;

public class DevAuthBypassMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public DevAuthBypassMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context, MeridianCreditDbContext dbContext)
    {
        var enableBypass = _configuration.GetValue<bool>("EnableDevAuthBypass");

        // If bypass enabled and request is not authenticated via JWT
        if (enableBypass && (context.User.Identity == null || !context.User.Identity.IsAuthenticated))
        {
            var devRoleHeader = context.Request.Headers["X-Dev-Role"].ToString();
            var targetRole = devRoleHeader.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? UserRole.Admin :
                             devRoleHeader.Equals("Merchant", StringComparison.OrdinalIgnoreCase) ? UserRole.Merchant :
                             UserRole.Customer;

            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Role == targetRole);
            if (user != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                };

                var identity = new ClaimsIdentity(claims, "DevBypassAuth");
                context.User = new ClaimsPrincipal(identity);
            }
        }

        await _next(context);
    }
}
