
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

    public AuthService(
        MeridianCreditDbContext dbContext,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _dbContext = dbContext;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("Email is required.");
        }

        if (await _dbContext.Users.AnyAsync(
            u => u.Email.ToLower() == email,
            cancellationToken))
        {
            throw new InvalidOperationException(
                "User with this email already exists.");
        }

        // Admin accounts must be created through the admin seeding process.
        if (request.Role == UserRole.Admin)
        {
            throw new UnauthorizedAccessException(
                "Admin registration is not permitted.");
        }

        var username = string.IsNullOrWhiteSpace(request.Username)
            ? email.Split('@')[0]
            : request.Username.Trim();

        var baseUsername = username;
        var suffix = 1;

        while (await _dbContext.Users.AnyAsync(
            u => u.Username != null &&
                 u.Username.ToLower() == username.ToLower(),
            cancellationToken))
        {
            if (!string.IsNullOrWhiteSpace(request.Username))
            {
                throw new InvalidOperationException(
                    "User with this username already exists.");
            }

            username = $"{baseUsername}{suffix++}";
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Address = request.Address,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Role = request.Role,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Role == UserRole.Merchant)
        {
            user.MerchantProfile = new MerchantProfile
            {
                BusinessName = request.BusinessName ??
                    $"{request.FullName}'s Store",
                BusinessCategory = request.BusinessCategory ?? "Retail",
                BusinessAddress = request.BusinessAddress,
                GSTNumber = request.GSTNumber,
                Website = request.Website
            };
        }

        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        
        var welcomeNotif = new Notification
        {
            UserId = user.Id,
            Title = "Welcome to Meridian Credit",
            Message = "Your account is ready. Start your credit card application anytime.",
            NotificationType = NotificationType.General,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Notifications.AddAsync(
            welcomeNotif,
            cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GenerateAuthResponse(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var identifier = !string.IsNullOrWhiteSpace(request.EmailOrUsername)
            ? request.EmailOrUsername.Trim()
            : request.Email?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(identifier) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            throw new UnauthorizedAccessException(
                "Username/email and password are required.");
        }

        var normalizedIdentifier = identifier.ToLowerInvariant();

        var user = await _dbContext.Users
            .Include(u => u.MerchantProfile)
            .FirstOrDefaultAsync(
                u => u.Email.ToLower() == normalizedIdentifier ||
                     (u.Username != null &&
                      u.Username.ToLower() == normalizedIdentifier),
                cancellationToken);

        if (user == null ||
            string.IsNullOrWhiteSpace(user.PasswordHash) ||
            !BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash))
        {
            throw new UnauthorizedAccessException(
                "Incorrect username/email or password.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GenerateAuthResponse(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedAccessException(
                "Refresh token is required.");
        }

        var tokenRecord = await _dbContext.RefreshTokens
            .Include(r => r.User)
            .ThenInclude(u => u.MerchantProfile)
            .FirstOrDefaultAsync(
                r => r.Token == refreshToken,
                cancellationToken);

        if (tokenRecord == null ||
            tokenRecord.IsRevoked ||
            tokenRecord.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Invalid or expired refresh token.");
        }

        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTime.UtcNow;

        // GenerateAuthResponse saves the new refresh token
        // together with the old token's revoked status.
        return await GenerateAuthResponse(
            tokenRecord.User,
            cancellationToken);
    }

    public async Task RevokeRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenRecord = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(
                r => r.Token == refreshToken,
                cancellationToken);

        if (tokenRecord != null && !tokenRecord.IsRevoked)
        {
            tokenRecord.IsRevoked = true;
            tokenRecord.RevokedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> SendForgotPasswordOtpAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var contact = request.Contact?.Trim();

        if (string.IsNullOrWhiteSpace(contact))
        {
            return true;
        }

        var normalizedContact = contact.ToLowerInvariant();

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            u => (u.Email != null && u.Email.ToLower() == normalizedContact) ||
                 (u.Username != null && u.Username.ToLower() == normalizedContact) ||
                 u.PhoneNumber == contact,
            cancellationToken);

        if (user == null)
        {
            // Do not reveal whether an account exists.
            return true;
        }

        var otp = new OTP
        {
            UserId = user.Id,
            OtpCode = "123456",
            OtpType = OTPPurpose.PasswordReset,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.OTPs.AddAsync(otp, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var contact = request.Contact?.Trim();

        if (string.IsNullOrWhiteSpace(contact) ||
            string.IsNullOrWhiteSpace(request.Otp) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            throw new InvalidOperationException(
                "All required fields must be provided.");
        }

        var normalizedContact = contact.ToLowerInvariant();

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            u => (u.Email != null && u.Email.ToLower() == normalizedContact) ||
                 (u.Username != null && u.Username.ToLower() == normalizedContact) ||
                 u.PhoneNumber == contact,
            cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("Account not found.");
        }

        var validOtp = await _dbContext.OTPs
            .FirstOrDefaultAsync(
                o => o.UserId == user.Id &&
                     o.OtpCode == request.Otp &&
                     o.OtpType == OTPPurpose.PasswordReset &&
                     !o.IsUsed &&
                     o.ExpiresAt > DateTime.UtcNow,
                cancellationToken);

        if (validOtp == null)
        {
            throw new InvalidOperationException(
                "Invalid or expired verification code.");
        }

        validOtp.IsUsed = true;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(
            request.NewPassword);

        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<AuthResponse> GenerateAuthResponse(
        User user,
        CancellationToken cancellationToken)
    {
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        var refreshTokenRecord = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _dbContext.RefreshTokens.AddAsync(
            refreshTokenRecord,
            cancellationToken);

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

                MerchantProfile = user.MerchantProfile == null
                    ? null
                    : new MerchantProfileDto
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
