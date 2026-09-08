using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.DTOs.Responses;

public class CardDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardHolderName { get; set; } = string.Empty;
    public string MaskedCardNumber { get; set; } = string.Empty;
    public string LastFourDigits { get; set; } = string.Empty;
    public byte ExpiryMonth { get; set; }
    public short ExpiryYear { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal CreditLimit { get; set; }
    public string CardType { get; set; } = "Classic";
    public CardStatus CardStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}
