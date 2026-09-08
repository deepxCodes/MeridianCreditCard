using System.ComponentModel.DataAnnotations;

namespace MeridianCredit.API.Models.DTOs.Requests;

public class AddCardRequest
{
    [Required]
    [StringLength(150)]
    public string CardHolderName { get; set; } = string.Empty;

    [Required]
    [CreditCard]
    public string CardNumber { get; set; } = string.Empty;

    [Required]
    [Range(1, 12)]
    public byte ExpiryMonth { get; set; }

    [Required]
    [Range(2025, 2040)]
    public short ExpiryYear { get; set; }

    [Required]
    [StringLength(4, MinimumLength = 3)]
    public string Cvv { get; set; } = string.Empty;

    [Required]
    [Range(100.00, 1000000.00)]
    public decimal InitialSimulatedBalance { get; set; } = 50000.00m;
}
