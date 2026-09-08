namespace MeridianCredit.API.Configuration;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";
    public string Secret { get; set; } = "MeridianCreditSuperSecretKeyForJWTAuthentication20261234567890!";
    public string Issuer { get; set; } = "MeridianCreditAPI";
    public string Audience { get; set; } = "MeridianCreditApp";
    public int ExpiryMinutes { get; set; } = 60;
    public int RefreshTokenExpiryDays { get; set; } = 7;
}
