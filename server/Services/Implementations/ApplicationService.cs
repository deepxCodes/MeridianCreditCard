using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Services.Implementations;

public class ApplicationService : IApplicationService
{
    private readonly MeridianCreditDbContext _dbContext;

    private static readonly string[] StageNames = new[]
    {
        "Application submitted",
        "Documents verified",
        "Credit assessment",
        "Application review",
        "Decision",
        "Card issued"
    };

    public ApplicationService(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ApplicationResponse> SubmitApplicationAsync(int userId, CreateApplicationRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.CreditCardApplications
            .FirstOrDefaultAsync(a => a.UserId == userId && !a.IsDeleted, cancellationToken);

        var refCode = "MC-" + Random.Shared.Next(100000, 999999);

        var application = existing ?? new CreditCardApplication
        {
            UserId = userId,
            ApplicationReference = refCode,
            SubmittedAt = DateTime.UtcNow
        };

        application.FullName = request.FullName.Trim();
        application.DateOfBirth = request.DateOfBirth.Trim();
        application.TaxIdNumber = request.TaxIdNumber.Trim();
        application.MobileNumber = request.MobileNumber.Trim();
        application.Email = request.Email.Trim();
        application.Address = request.Address.Trim();
        application.City = request.City.Trim();
        application.State = request.State.Trim();
        application.ZipCode = request.ZipCode.Trim();

        application.EmploymentType = request.EmploymentType;
        application.EmployerName = request.EmployerName;
        application.JobTitle = request.JobTitle;
        application.WorkExperience = request.WorkExperience;
        application.EmploymentDuration = request.EmploymentDuration;
        application.OfficeAddress = request.OfficeAddress;

        application.AnnualIncome = request.AnnualIncome;
        application.ExistingLoans = request.ExistingLoans;
        application.ExistingCards = request.ExistingCards;
        application.MonthlyObligations = request.MonthlyObligations;
        application.EstimatedExpenses = request.EstimatedExpenses;
        application.PrimaryBankAccountLast4 = request.PrimaryBankAccountLast4;

        application.SelectedCardType = request.SelectedCardType;
        application.IdentityDocName = request.IdentityDocName;
        application.AddressDocName = request.AddressDocName;
        application.IncomeDocName = request.IncomeDocName;
        application.PhotoDocName = request.PhotoDocName;
        application.OtherDocName = request.OtherDocName;

        application.CurrentStage = 1;
        application.IsRejected = false;
        application.RejectionReason = null;
        application.LastStageUpdatedAt = DateTime.UtcNow;

        if (existing == null)
        {
            await _dbContext.CreditCardApplications.AddAsync(application, cancellationToken);
        }

        // Add notification
        var notif = new Notification
        {
            UserId = userId,
            Title = "Application received",
            Message = $"Your application {application.ApplicationReference} has been received and queued for document verification.",
            NotificationType = NotificationType.General,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _dbContext.Notifications.AddAsync(notif, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(application);
    }

    public async Task<ApplicationResponse?> GetCurrentApplicationAsync(int userId, CancellationToken cancellationToken = default)
    {
        var application = await _dbContext.CreditCardApplications
            .Include(a => a.IssuedCard)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(a => a.UserId == userId && !a.IsDeleted, cancellationToken);

        return application == null ? null : MapToResponse(application);
    }

    public async Task<ApplicationResponse> AdvanceStageAsync(int userId, AdvanceStageRequest request, CancellationToken cancellationToken = default)
    {
        var application = await _dbContext.CreditCardApplications
            .Include(a => a.IssuedCard)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(a => a.UserId == userId && !a.IsDeleted, cancellationToken);

        if (application == null)
        {
            throw new InvalidOperationException("No active application found to advance.");
        }

        if (application.IsRejected && application.CurrentStage == 5)
        {
            throw new InvalidOperationException("Application is already rejected and closed.");
        }

        if (request.TargetStage.HasValue && request.TargetStage.Value >= 1 && request.TargetStage.Value <= 6)
        {
            application.CurrentStage = request.TargetStage.Value;
        }
        else if (application.CurrentStage < 6)
        {
            // Stage 4 -> 5 decision
            if (application.CurrentStage == 4)
            {
                // Random reject chance or forced reject
                var reject = request.ForceReject ?? (Random.Shared.NextDouble() < 0.15);
                if (reject)
                {
                    application.IsRejected = true;
                    application.RejectionReason = request.RejectionReason ?? "Credit score criteria not met.";
                }
            }
            application.CurrentStage++;
        }

        application.LastStageUpdatedAt = DateTime.UtcNow;

        // If reached stage 6 and approved, issue the virtual card if not yet issued
        if (application.CurrentStage == 6 && !application.IsRejected && application.IssuedCardId == null)
        {
            decimal creditLimit = application.SelectedCardType switch
            {
                "Premium" => 500000m,
                "Rewards" => 200000m,
                _ => 100000m
            };

            var lastFour = Random.Shared.Next(1000, 9999).ToString();
            var fullNumber = $"4821{Random.Shared.Next(1000, 9999)}{Random.Shared.Next(1000, 9999)}{lastFour}";

            var card = new Card
            {
                UserId = userId,
                CardHolderName = application.FullName.ToUpper(),
                MaskedCardNumber = $"•••• •••• •••• {lastFour}",
                LastFourDigits = lastFour,
                CardType = application.SelectedCardType,
                CreditLimit = creditLimit,
                AvailableBalance = creditLimit,
                ExpiryMonth = (byte)DateTime.UtcNow.Month,
                ExpiryYear = (short)(DateTime.UtcNow.Year + 5),
                CardStatus = CardStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Cards.AddAsync(card, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            application.IssuedCardId = card.Id;
            application.IssuedCard = card;
        }

        // Notification for stage advancement
        var stageTitle = application.IsRejected && application.CurrentStage == 5
            ? "Application update: Not Approved"
            : $"Application update: {GetStageLabel(application.CurrentStage, application.IsRejected)}";

        var notifMsg = application.IsRejected && application.CurrentStage == 5
            ? $"Application {application.ApplicationReference} was not approved. Reason: {application.RejectionReason ?? "Credit threshold not met"}."
            : $"Application {application.ApplicationReference} has moved to: {GetStageLabel(application.CurrentStage, application.IsRejected)}.";

        var notif = new Notification
        {
            UserId = userId,
            Title = stageTitle,
            Message = notifMsg,
            NotificationType = NotificationType.General,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _dbContext.Notifications.AddAsync(notif, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(application);
    }

    public async Task<string> UploadDocumentAsync(int userId, string docType, IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("No file provided.");
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            throw new ArgumentException("File size exceeds 5 MB limit.");
        }

        var fileName = Path.GetFileName(file.FileName);
        return fileName;
    }

    private static string GetStageLabel(int stage, bool isRejected)
    {
        if (stage == 5) return isRejected ? "Rejected" : "Approved";
        if (stage >= 1 && stage <= StageNames.Length) return StageNames[stage - 1];
        return "In Progress";
    }

    private static ApplicationResponse MapToResponse(CreditCardApplication app)
    {
        var docs = new Dictionary<string, string>();
        if (!string.IsNullOrEmpty(app.IdentityDocName)) docs["identity"] = app.IdentityDocName;
        if (!string.IsNullOrEmpty(app.AddressDocName)) docs["address"] = app.AddressDocName;
        if (!string.IsNullOrEmpty(app.IncomeDocName)) docs["income"] = app.IncomeDocName;
        if (!string.IsNullOrEmpty(app.PhotoDocName)) docs["photo"] = app.PhotoDocName;
        if (!string.IsNullOrEmpty(app.OtherDocName)) docs["other"] = app.OtherDocName;

        return new ApplicationResponse
        {
            Id = app.Id,
            ApplicationReference = app.ApplicationReference,
            UserId = app.UserId,
            FullName = app.FullName,
            DateOfBirth = app.DateOfBirth,
            TaxIdNumber = app.TaxIdNumber,
            MobileNumber = app.MobileNumber,
            Email = app.Email,
            Address = app.Address,
            City = app.City,
            State = app.State,
            ZipCode = app.ZipCode,
            EmploymentType = app.EmploymentType,
            EmployerName = app.EmployerName,
            JobTitle = app.JobTitle,
            WorkExperience = app.WorkExperience,
            EmploymentDuration = app.EmploymentDuration,
            OfficeAddress = app.OfficeAddress,
            AnnualIncome = app.AnnualIncome,
            ExistingLoans = app.ExistingLoans,
            ExistingCards = app.ExistingCards,
            MonthlyObligations = app.MonthlyObligations,
            EstimatedExpenses = app.EstimatedExpenses,
            PrimaryBankAccountLast4 = app.PrimaryBankAccountLast4,
            SelectedCardType = app.SelectedCardType,
            Documents = docs,
            CurrentStage = app.CurrentStage,
            StageName = GetStageLabel(app.CurrentStage, app.IsRejected),
            IsRejected = app.IsRejected,
            RejectionReason = app.RejectionReason,
            SubmittedAt = app.SubmittedAt,
            LastStageUpdatedAt = app.LastStageUpdatedAt,
            IssuedCard = app.IssuedCard == null ? null : new CardDto
            {
                Id = app.IssuedCard.Id,
                CardHolderName = app.IssuedCard.CardHolderName,
                MaskedCardNumber = app.IssuedCard.MaskedCardNumber,
                LastFourDigits = app.IssuedCard.LastFourDigits,
                ExpiryMonth = app.IssuedCard.ExpiryMonth,
                ExpiryYear = app.IssuedCard.ExpiryYear,
                CardStatus = app.IssuedCard.CardStatus,
                AvailableBalance = app.IssuedCard.AvailableBalance,
                CreditLimit = app.IssuedCard.CreditLimit,
                CardType = app.IssuedCard.CardType
            }
        };
    }
}
