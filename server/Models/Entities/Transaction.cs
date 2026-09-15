using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.Entities;

public class Transaction : BaseEntity
{
    public string TransactionReference { get; set; } = string.Empty;
    public int CardId { get; set; }
    public int CustomerId { get; set; }
    public int MerchantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public TransactionStatus TransactionStatus { get; set; } = TransactionStatus.Pending;
    public string GatewayResponse { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Card Card { get; set; } = null!;
    public virtual User Customer { get; set; } = null!;
    public virtual MerchantProfile Merchant { get; set; } = null!;
    public virtual FraudLog? FraudLog { get; set; }
}
