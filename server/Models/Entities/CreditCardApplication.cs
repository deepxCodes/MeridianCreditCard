namespace MeridianCredit.API.Models.Entities;

public class CreditCardApplication : BaseEntity
{
    public string ApplicationReference { get; set; } = string.Empty; // e.g. MC-837492
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;

    // Step 1: Personal
    public string FullName { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string TaxIdNumber { get; set; } = string.Empty; // PAN
    public string MobileNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;

    // Step 2: Employment
    public string EmploymentType { get; set; } = string.Empty;
    public string? EmployerName { get; set; }
    public string? JobTitle { get; set; }
    public string? WorkExperience { get; set; }
    public string? EmploymentDuration { get; set; }
    public string? OfficeAddress { get; set; }

    // Step 3: Financial
    public decimal AnnualIncome { get; set; }
    public string? ExistingLoans { get; set; }
    public string? ExistingCards { get; set; }
    public decimal? MonthlyObligations { get; set; }
    public decimal? EstimatedExpenses { get; set; }
    public string? PrimaryBankAccountLast4 { get; set; }

    // Step 4: Card Choice
    public string SelectedCardType { get; set; } = "Classic"; // Classic, Rewards, Premium

    // Step 5: Documents (filenames/paths)
    public string? IdentityDocName { get; set; }
    public string? AddressDocName { get; set; }
    public string? IncomeDocName { get; set; }
    public string? PhotoDocName { get; set; }
    public string? OtherDocName { get; set; }

    // Tracking / Stage
    public int CurrentStage { get; set; } = 1; // 1: Submitted, 2: Documents Verified, 3: Credit Assessment, 4: Application Review, 5: Decision, 6: Card Issued
    public bool IsRejected { get; set; } = false;
    public string? RejectionReason { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastStageUpdatedAt { get; set; }

    // Issued Card link
    public int? IssuedCardId { get; set; }
    public virtual Card? IssuedCard { get; set; }
}
