using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.Entities;

public class FraudLog : BaseEntity
{
    public int TransactionId { get; set; }
    public string FraudReason { get; set; } = string.Empty;
    public FraudSeverity Severity { get; set; } = FraudSeverity.Low;
    public bool IsResolved { get; set; } = false;
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Navigation Properties
    public virtual Transaction Transaction { get; set; } = null!;
}
