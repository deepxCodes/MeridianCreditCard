using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.Entities;

public class Card : BaseEntity
{
    public int UserId { get; set; }
    public string CardHolderName { get; set; } = string.Empty;
    public string MaskedCardNumber { get; set; } = string.Empty;
    public string LastFourDigits { get; set; } = string.Empty;
    public byte ExpiryMonth { get; set; }
    public short ExpiryYear { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal CreditLimit { get; set; } = 100000m;
    public string CardType { get; set; } = "Classic";
    public CardStatus CardStatus { get; set; } = CardStatus.Active;

    // Navigation Properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
