namespace MeridianCredit.API.Models.Entities;

public class SupportTicket : BaseEntity
{
    public int? UserId { get; set; }
    public virtual User? User { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "Open"; // Open, InProgress, Resolved
    public string? AdminResponse { get; set; }
}
