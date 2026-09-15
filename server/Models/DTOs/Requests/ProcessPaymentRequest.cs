using System.ComponentModel.DataAnnotations;

namespace MeridianCredit.API.Models.DTOs.Requests;

public class ProcessPaymentRequest
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int MerchantId { get; set; }

    [Required]
    public int CardId { get; set; }

    [Required]
    [Range(0.01, 1000000.00, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(4, MinimumLength = 3, ErrorMessage = "CVV must be 3 or 4 digits.")]
    public string Cvv { get; set; } = string.Empty;
}
