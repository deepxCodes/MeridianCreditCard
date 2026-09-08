using MeridianCredit.API.Enums;

namespace MeridianCredit.API.ServicesInternal.Notification;

public interface INotificationService
{
    Task SendNotificationAsync(
        int userId,
        NotificationType type,
        string subject,
        string message,
        CancellationToken cancellationToken = default);

    Task SendOTPNotificationAsync(
        int userId,
        string email,
        string otpCode,
        OTPPurpose purpose,
        CancellationToken cancellationToken = default);
}
