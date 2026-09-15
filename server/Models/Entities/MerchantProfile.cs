namespace MeridianCredit.API.Models.Entities;

public class MerchantProfile : BaseEntity
{
    public int UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessCategory { get; set; } = string.Empty;
    public string? BusinessAddress { get; set; }
    public string? GSTNumber { get; set; }
    public string? Website { get; set; }

    // Navigation Properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
