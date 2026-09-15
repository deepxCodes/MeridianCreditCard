using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System.Linq;

namespace MeridianCredit.API.Middleware
{
    public class IpWhitelistMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<IpWhitelistMiddleware> _logger;
        private readonly string[] _whitelist;

        public IpWhitelistMiddleware(RequestDelegate next, ILogger<IpWhitelistMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            // Configuration section "IpWhitelist": ["127.0.0.1", "::1"]
            _whitelist = configuration.GetSection("IpWhitelist").Get<string[]>() ?? new string[0];
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Apply only to admin endpoints
            if (context.Request.Path.StartsWithSegments("/admin"))
            {
                var remoteIp = context.Connection.RemoteIpAddress?.ToString();
                if (remoteIp == null || !_whitelist.Contains(remoteIp))
                {
                    _logger.LogWarning("Blocked IP {RemoteIp} from accessing admin endpoint {Path}", remoteIp, context.Request.Path);
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Forbidden: IP not allowed.");
                    return;
                }
            }
            await _next(context);
        }
    }
}
