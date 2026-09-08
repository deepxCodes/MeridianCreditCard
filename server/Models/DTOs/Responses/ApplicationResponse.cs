namespace MeridianCredit.API.Models.DTOs.Responses;

public class ApplicationResponse
{
    public int Id { get; set; }
    public string ApplicationReference { get; set; } = string.Empty;
    public int UserId { get; set; }

    // Personal
    public string FullName { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string TaxIdNumber { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;

    // Employment
    public string EmploymentType { get; set; } = string.Empty;
    public string? EmployerName { get; set; }
    public string? JobTitle { get; set; }
    public string? WorkExperience { get; set; }
    public string? EmploymentDuration { get; set; }
    public string? OfficeAddress { get; set; }

    // Financial
    public decimal AnnualIncome { get; set; }
    public string? ExistingLoans { get; set; }
    public string? ExistingCards { get; set; }
    public decimal? MonthlyObligations { get; set; }
    public decimal? EstimatedExpenses { get; set; }
    public string? PrimaryBankAccountLast4 { get; set; }

    // Card Choice
    public string SelectedCardType { get; set; } = "Classic";

    // Documents
    public Dictionary<string, string> Documents { get; set; } = new();

    // Stage tracking
    public int CurrentStage { get; set; } = 1;
    public string StageName { get; set; } = "Application submitted";
    public bool IsRejected { get; set; } = false;
    public string? RejectionReason { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? LastStageUpdatedAt { get; set; }

    // Issued Card
    public CardDto? IssuedCard { get; set; }
}
