namespace MeridianCredit.API.Models.Entities;

public class RefreshToken : BaseEntity
{
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsRevoked { get; set; } = false;

    // Navigation Properties
    public virtual User User { get; set; } = null!;
}
