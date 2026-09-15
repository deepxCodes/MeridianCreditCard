using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.Entities;

public class Notification : BaseEntity
{
    public int UserId { get; set; }
    public NotificationType NotificationType { get; set; } = NotificationType.General;
    public string Subject { get; set; } = string.Empty;
    public string Title { get => Subject; set => Subject = value; }
    public string Message { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; } = NotificationStatus.Pending;
    public bool IsRead { get; set; } = false;
    public DateTime? SentAt { get; set; }

    // Navigation Properties
    public virtual User User { get; set; } = null!;
}
