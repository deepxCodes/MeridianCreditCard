using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.DTOs.Responses;

public class ProcessPaymentResponse
{
    public int TransactionId { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public TransactionStatus Status { get; set; }
    public string GatewayResponse { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public DateTime ProcessedAt { get; set; }
    public bool IsFraudFlagged { get; set; }
    public FraudSeverity? FraudSeverity { get; set; }
}
