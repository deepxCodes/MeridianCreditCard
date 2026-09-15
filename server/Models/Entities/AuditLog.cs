namespace MeridianCredit.API.Models.Entities;

public class AuditLog : BaseEntity
{
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string? Description { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation Properties
    public virtual User? User { get; set; }
}
