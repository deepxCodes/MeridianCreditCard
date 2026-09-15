using MeridianCredit.API.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace MeridianCredit.API.Models.Entities;

public class OTP : BaseEntity
{
    public int UserId { get; set; }

public string OTPCode { get; set; } = string.Empty;

[NotMapped]
public string OtpCode
{
    get => OTPCode;
    set => OTPCode = value;
}
    public OTPPurpose Purpose { get; set; } = OTPPurpose.Registration;
    public OTPPurpose OtpType { get => Purpose; set => Purpose = value; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime? UsedAt { get; set; }

    // Navigation Properties
    public virtual User User { get; set; } = null!;
}
