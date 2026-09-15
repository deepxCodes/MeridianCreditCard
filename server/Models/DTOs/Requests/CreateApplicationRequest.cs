using System.ComponentModel.DataAnnotations;

namespace MeridianCredit.API.Models.DTOs.Requests;

public class CreateApplicationRequest
{
    // Step 1: Personal
    [Required]
    public string FullName { get; set; } = string.Empty;
    [Required]
    public string DateOfBirth { get; set; } = string.Empty;
    [Required]
    public string TaxIdNumber { get; set; } = string.Empty; // PAN
    [Required]
    public string MobileNumber { get; set; } = string.Empty;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Address { get; set; } = string.Empty;
    [Required]
    public string City { get; set; } = string.Empty;
    [Required]
    public string State { get; set; } = string.Empty;
    [Required]
    public string ZipCode { get; set; } = string.Empty;

    // Step 2: Employment
    [Required]
    public string EmploymentType { get; set; } = string.Empty;
    public string? EmployerName { get; set; }
    public string? JobTitle { get; set; }
    public string? WorkExperience { get; set; }
    public string? EmploymentDuration { get; set; }
    public string? OfficeAddress { get; set; }

    // Step 3: Financial
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Annual income must be greater than zero.")]
    public decimal AnnualIncome { get; set; }
    public string? ExistingLoans { get; set; }
    public string? ExistingCards { get; set; }
    public decimal? MonthlyObligations { get; set; }
    public decimal? EstimatedExpenses { get; set; }
    public string? PrimaryBankAccountLast4 { get; set; }

    // Step 4: Card
    [Required]
    public string SelectedCardType { get; set; } = "Classic"; // Classic, Rewards, Premium

    // Step 5: Documents
    public string? IdentityDocName { get; set; }
    public string? AddressDocName { get; set; }
    public string? IncomeDocName { get; set; }
    public string? PhotoDocName { get; set; }
    public string? OtherDocName { get; set; }
}
