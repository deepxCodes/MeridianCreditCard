using MeridianCredit.API.Enums;

namespace MeridianCredit.API.Models.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsEmailVerified { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }

    public string? Username { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    // Navigation Properties
    public virtual MerchantProfile? MerchantProfile { get; set; }
    public virtual ICollection<Card> Cards { get; set; } = new List<Card>();
    public virtual ICollection<CreditCardApplication> Applications { get; set; } = new List<CreditCardApplication>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<OTP> OTPs { get; set; } = new List<OTP>();
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
