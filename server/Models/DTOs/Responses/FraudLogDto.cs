using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.DTOs.Responses;

public class FraudLogDto
{
    public int Id { get; set; }
    public int TransactionId { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string FraudReason { get; set; } = string.Empty;
    public FraudSeverity Severity { get; set; }
    public bool IsResolved { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
