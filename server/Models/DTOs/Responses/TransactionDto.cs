using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.DTOs.Responses;

public class TransactionDto
{
    public int Id { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public int CardId { get; set; }
    public string MaskedCardNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int MerchantId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public TransactionStatus TransactionStatus { get; set; }
    public string GatewayResponse { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
    public DateTime ProcessedAt { get; set; }
    public bool IsFraudFlagged { get; set; }
}
