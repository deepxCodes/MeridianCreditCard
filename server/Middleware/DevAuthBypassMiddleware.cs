using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Middleware;

/// <summary>
/// Development-only middleware that injects a test identity based on an
/// explicit X-Dev-Role header. Only activates when ALL of the following are true:
///   1. The host environment is Development.
///   2. EnableDevAuthBypass is explicitly set to true in configuration.
///   3. The request is not already authenticated via a real JWT.
///   4. The X-Dev-Role header is present and non-empty.
///
/// Production safety: Even if EnableDevAuthBypass were set to true in production
/// configuration by mistake, the IsDevelopment() check prevents activation.
/// </summary>
public class DevAuthBypassMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public DevAuthBypassMiddleware(
        RequestDelegate next,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _next = next;
        _configuration = configuration;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context, MeridianCreditDbContext dbContext)
    {
        // PRODUCTION GUARD: bypass cannot activate outside Development, regardless of config
        if (!_environment.IsDevelopment())
        {
            await _next(context);
            return;
        }

        var enableBypass = _configuration.GetValue<bool>("EnableDevAuthBypass");
        if (!enableBypass)
        {
            await _next(context);
            return;
        }

        // Already authenticated via JWT — do not override
        if (context.User.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        // Require an explicit X-Dev-Role header. No header → no bypass, no default identity.
        var devRoleHeader = context.Request.Headers["X-Dev-Role"].ToString();
        if (string.IsNullOrWhiteSpace(devRoleHeader))
        {
            await _next(context);
            return;
        }

        var targetRole = devRoleHeader.Trim().Equals("Admin", StringComparison.OrdinalIgnoreCase) ? UserRole.Admin :
                         devRoleHeader.Trim().Equals("Merchant", StringComparison.OrdinalIgnoreCase) ? UserRole.Merchant :
                         devRoleHeader.Trim().Equals("Customer", StringComparison.OrdinalIgnoreCase) ? UserRole.Customer :
                         (UserRole?)null;

        if (targetRole == null)
        {
            // Unknown role value — do not inject any identity
            await _next(context);
            return;
        }

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

        await _next(context);
    }
}
