using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;

namespace MeridianCredit.API.ServicesInternal.Notification;

public class NotificationService : INotificationService
{
    private readonly MeridianCreditDbContext _dbContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(MeridianCreditDbContext dbContext, ILogger<NotificationService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SendNotificationAsync(
        int userId,
        NotificationType type,
        string subject,
        string message,
        CancellationToken cancellationToken = default)
    {
        var notification = new Models.Entities.Notification
        {
            UserId = userId,
            NotificationType = type,
            Subject = subject,
            Message = message,
            Status = NotificationStatus.Sent,
            SentAt = DateTime.UtcNow
        };

        await _dbContext.Notifications.AddAsync(notification, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("NOTIFICATION SENT [User: {UserId}, Type: {Type}]: {Subject} - {Message}",
            userId, type, subject, message);
    }

    public async Task SendOTPNotificationAsync(
        int userId,
        string email,
        string otpCode,
        OTPPurpose purpose,
        CancellationToken cancellationToken = default)
    {
        var subject = $"Meridian Credit - Your OTP for {purpose}";
        var message = $"Your One-Time Password (OTP) for {purpose} is: {otpCode}. Valid for 5 minutes. Do not share with anyone.";

        await SendNotificationAsync(userId, NotificationType.OTP, subject, message, cancellationToken);
    }
}
