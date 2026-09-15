using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Authentication;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly MeridianCreditDbContext _dbContext;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(MeridianCreditDbContext dbContext, IJwtTokenGenerator jwtTokenGenerator)
    {
        _dbContext = dbContext;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await _dbContext.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        if (!string.IsNullOrEmpty(request.Username) && 
            await _dbContext.Users.AnyAsync(u => u.Username == request.Username, cancellationToken))
        {
            throw new InvalidOperationException("User with this username already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Username = string.IsNullOrWhiteSpace(request.Username) ? request.Email.Split('@')[0] : request.Username.Trim(),
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Address = request.Address,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Role = request.Role,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        if (request.Role == UserRole.Merchant)
        {
            user.MerchantProfile = new MerchantProfile
            {
                BusinessName = request.BusinessName ?? $"{request.FullName}'s Store",
                BusinessCategory = request.BusinessCategory ?? "Retail",
                BusinessAddress = request.BusinessAddress,
                GSTNumber = request.GSTNumber,
                Website = request.Website
            };
        }

        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Add a default welcome notification
        var welcomeNotif = new Notification
        {
            UserId = user.Id,
            Title = "Welcome to Meridian Credit",
            Message = "Your account is ready. Start your credit card application anytime.",
            NotificationType = NotificationType.General,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _dbContext.Notifications.AddAsync(welcomeNotif, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GenerateAuthResponse(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var identifier = !string.IsNullOrWhiteSpace(request.EmailOrUsername)
            ? request.EmailOrUsername.Trim()
            : request.Email?.Trim() ?? string.Empty;

        var user = await _dbContext.Users
            .Include(u => u.MerchantProfile)
            .FirstOrDefaultAsync(u => u.Email == identifier || u.Username == identifier, cancellationToken);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Incorrect username/email or password.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GenerateAuthResponse(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenRecord = await _dbContext.RefreshTokens
            .Include(r => r.User)
            .ThenInclude(u => u.MerchantProfile)
            .FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);

        if (tokenRecord == null || tokenRecord.IsRevoked || tokenRecord.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTime.UtcNow;

        var authResponse = await GenerateAuthResponse(tokenRecord.User, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return authResponse;
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenRecord = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken);

        if (tokenRecord != null && !tokenRecord.IsRevoked)
        {
            tokenRecord.IsRevoked = true;
            tokenRecord.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> SendForgotPasswordOtpAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var contact = request.Contact.Trim();
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == contact || u.PhoneNumber == contact || u.Username == contact, cancellationToken);
        if (user == null)
        {
            // For security, return true even if user doesn't exist
            return true;
        }

        var otp = new OTP
        {
            UserId = user.Id,
            OtpCode = "123456", // Demo fixed OTP matching UI specification
            OtpType = OTPPurpose.PasswordReset,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.OTPs.AddAsync(otp, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var contact = request.Contact.Trim();
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == contact || u.PhoneNumber == contact || u.Username == contact, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException("Account not found.");
        }

        if (request.Otp != "123456")
        {
            var validOtp = await _dbContext.OTPs.FirstOrDefaultAsync(o => o.UserId == user.Id && o.OtpCode == request.Otp && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow, cancellationToken);
            if (validOtp == null)
            {
                throw new InvalidOperationException("Invalid or expired verification code.");
            }
            validOtp.IsUsed = true;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<AuthResponse> GenerateAuthResponse(User user, CancellationToken cancellationToken)
    {
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        var refreshTokenRecord = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _dbContext.RefreshTokens.AddAsync(refreshTokenRecord, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
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
                LastLoginAt = user.LastLoginAt,
                MerchantProfile = user.MerchantProfile == null ? null : new MerchantProfileDto
                {
                    Id = user.MerchantProfile.Id,
                    BusinessName = user.MerchantProfile.BusinessName,
                    BusinessCategory = user.MerchantProfile.BusinessCategory,
                    BusinessAddress = user.MerchantProfile.BusinessAddress,
                    GSTNumber = user.MerchantProfile.GSTNumber,
                    Website = user.MerchantProfile.Website
                }
            }
        };
    }
}
