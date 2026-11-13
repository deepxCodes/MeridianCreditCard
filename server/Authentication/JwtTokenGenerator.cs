
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MeridianCredit.API.Configuration;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.Authentication;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtSettings _jwtSettings;
    private readonly SymmetricSecurityKey _signingKey;

    public JwtTokenGenerator(IOptions<JwtSettings> jwtSettingsOptions)
    {
        _jwtSettings = jwtSettingsOptions.Value;

        if (string.IsNullOrWhiteSpace(_jwtSettings.Secret) ||
            Encoding.UTF8.GetByteCount(_jwtSettings.Secret) < 32)
        {
            throw new InvalidOperationException(
                "JWT Secret must contain at least 32 bytes.");
        }

        if (string.IsNullOrWhiteSpace(_jwtSettings.Issuer) ||
            string.IsNullOrWhiteSpace(_jwtSettings.Audience))
        {
            throw new InvalidOperationException(
                "JWT Issuer and Audience must be configured.");
        }

        if (_jwtSettings.ExpiryMinutes <= 0)
        {
            throw new InvalidOperationException(
                "JWT ExpiryMinutes must be greater than zero.");
        }

        _signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.Secret));
    }

    public string GenerateAccessToken(User user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        var credentials = new SigningCredentials(
            _signingKey,
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()),

            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new Claim(
                JwtRegisteredClaimNames.Email,
                user.Email),

            new Claim(
                JwtRegisteredClaimNames.Name,
                user.FullName),

            new Claim(
                ClaimTypes.Role,
                user.Role.ToString()),

            new Claim(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        var now = DateTime.UtcNow;

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            notBefore: now,
            expires: now.AddMinutes(_jwtSettings.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];

        using var rng = RandomNumberGenerator.Create();

        rng.GetBytes(randomNumber);

        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new SecurityTokenException(
                "Token cannot be empty.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();

        // Check the token algorithm before validating it.
        var parsedToken = tokenHandler.ReadJwtToken(token);

        if (!string.Equals(
            parsedToken.Header.Alg,
            SecurityAlgorithms.HmacSha256,
            StringComparison.Ordinal))
        {
            throw new SecurityTokenException(
                "Invalid token signing algorithm.");
        }

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidAudience = _jwtSettings.Audience,

            ValidateIssuer = true,
            ValidIssuer = _jwtSettings.Issuer,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _signingKey,

            RequireExpirationTime = true,
            ValidateLifetime = false,

            ClockSkew = TimeSpan.Zero
        };

        var principal = tokenHandler.ValidateToken(
            token,
            tokenValidationParameters,
            out var validatedToken);

        if (validatedToken is not JwtSecurityToken jwtSecurityToken ||
            !string.Equals(
                jwtSecurityToken.Header.Alg,
                SecurityAlgorithms.HmacSha256,
                StringComparison.Ordinal))
        {
            throw new SecurityTokenException(
                "Invalid token format or algorithm.");
        }

        // This method is specifically for expired access tokens.
        if (jwtSecurityToken.ValidTo > DateTime.UtcNow)
        {
            throw new SecurityTokenException(
                "The access token has not expired yet.");
        }

        return principal;
    }
}
