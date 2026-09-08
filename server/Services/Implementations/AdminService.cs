using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly MeridianCreditDbContext _dbContext;

    public AdminService(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _dbContext.Users
            .Include(u => u.MerchantProfile)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Role = u.Role,
            IsEmailVerified = u.IsEmailVerified,
            LastLoginAt = u.LastLoginAt,
            MerchantProfile = u.MerchantProfile == null ? null : new MerchantProfileDto
            {
                Id = u.MerchantProfile.Id,
                BusinessName = u.MerchantProfile.BusinessName,
                BusinessCategory = u.MerchantProfile.BusinessCategory,
                BusinessAddress = u.MerchantProfile.BusinessAddress,
                GSTNumber = u.MerchantProfile.GSTNumber,
                Website = u.MerchantProfile.Website
            }
        }).ToList();
    }

    public async Task<IReadOnlyList<MerchantProfileDto>> GetAllMerchantsAsync(CancellationToken cancellationToken = default)
    {
        var merchants = await _dbContext.MerchantProfiles
            .OrderBy(m => m.BusinessName)
            .ToListAsync(cancellationToken);

        return merchants.Select(m => new MerchantProfileDto
        {
            Id = m.Id,
            BusinessName = m.BusinessName,
            BusinessCategory = m.BusinessCategory,
            BusinessAddress = m.BusinessAddress,
            GSTNumber = m.GSTNumber,
            Website = m.Website
        }).ToList();
    }

    public async Task<IReadOnlyList<FraudLogDto>> GetFraudLogsAsync(CancellationToken cancellationToken = default)
    {
        var logs = await _dbContext.FraudLogs
            .Include(f => f.Transaction)
            .ThenInclude(t => t.Customer)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);

        return logs.Select(f => new FraudLogDto
        {
            Id = f.Id,
            TransactionId = f.TransactionId,
            TransactionReference = f.Transaction?.TransactionReference ?? "N/A",
            Amount = f.Transaction?.Amount ?? 0,
            CustomerName = f.Transaction?.Customer?.FullName ?? "N/A",
            FraudReason = f.FraudReason,
            Severity = f.Severity,
            IsResolved = f.IsResolved,
            ResolvedBy = f.ResolvedBy,
            ResolvedAt = f.ResolvedAt,
            CreatedAt = f.CreatedAt
        }).ToList();
    }

    public async Task ResolveFraudLogAsync(int fraudLogId, string adminName, CancellationToken cancellationToken = default)
    {
        var log = await _dbContext.FraudLogs.FirstOrDefaultAsync(f => f.Id == fraudLogId, cancellationToken);
        if (log == null)
        {
            throw new KeyNotFoundException("Fraud log entry not found.");
        }

        log.IsResolved = true;
        log.ResolvedBy = adminName;
        log.ResolvedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        var totalUsers = await _dbContext.Users.CountAsync(cancellationToken);
        var totalCustomers = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Customer, cancellationToken);
        var totalMerchants = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Merchant, cancellationToken);

        var totalTransactions = await _dbContext.Transactions.CountAsync(cancellationToken);
        var totalApproved = await _dbContext.Transactions.CountAsync(t => t.TransactionStatus == TransactionStatus.Approved, cancellationToken);
        var totalDeclined = await _dbContext.Transactions.CountAsync(t => t.TransactionStatus == TransactionStatus.Declined || t.TransactionStatus == TransactionStatus.Failed, cancellationToken);

        var totalVolume = await _dbContext.Transactions
            .Where(t => t.TransactionStatus == TransactionStatus.Approved)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0.00m;

        var totalFraud = await _dbContext.FraudLogs.CountAsync(cancellationToken);
        var pendingFraud = await _dbContext.FraudLogs.CountAsync(f => !f.IsResolved, cancellationToken);

        var approvalRate = totalTransactions > 0 ? (double)totalApproved / totalTransactions * 100.0 : 100.0;

        return new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalCustomers = totalCustomers,
            TotalMerchants = totalMerchants,
            TotalTransactions = totalTransactions,
            TotalVolumeAmount = totalVolume,
            TotalApprovedTransactions = totalApproved,
            TotalDeclinedTransactions = totalDeclined,
            TotalFraudLogsCount = totalFraud,
            PendingFraudLogsCount = pendingFraud,
            ApprovalRatePercentage = Math.Round(approvalRate, 2)
        };
    }

    public async Task<IReadOnlyList<ApplicationResponse>> GetAllApplicationsAsync(CancellationToken cancellationToken = default)
    {
        var apps = await _dbContext.CreditCardApplications
            .Include(a => a.IssuedCard)
            .OrderByDescending(a => a.SubmittedAt)
            .ToListAsync(cancellationToken);

        return apps.Select(MapApplicationToResponse).ToList();
    }

    public async Task<ApplicationResponse> UpdateApplicationStageAsync(int applicationId, int stage, bool? isRejected, string? reason, CancellationToken cancellationToken = default)
    {
        var app = await _dbContext.CreditCardApplications
            .Include(a => a.IssuedCard)
            .FirstOrDefaultAsync(a => a.Id == applicationId, cancellationToken);

        if (app == null)
        {
            throw new KeyNotFoundException("Credit card application not found.");
        }

        if (stage >= 1 && stage <= 6)
        {
            app.CurrentStage = stage;
        }

        if (isRejected.HasValue)
        {
            app.IsRejected = isRejected.Value;
            if (isRejected.Value && !string.IsNullOrWhiteSpace(reason))
            {
                app.RejectionReason = reason;
            }
        }

        app.LastStageUpdatedAt = DateTime.UtcNow;

        // If advanced to stage 6 (Card issued) and approved, create virtual card if not present
        if (app.CurrentStage == 6 && !app.IsRejected && app.IssuedCardId == null)
        {
            decimal creditLimit = app.SelectedCardType switch
            {
                "Premium" => 500000m,
                "Rewards" => 200000m,
                _ => 100000m
            };

            var lastFour = Random.Shared.Next(1000, 9999).ToString();
            var card = new Card
            {
                UserId = app.UserId,
                CardHolderName = app.FullName.ToUpper(),
                MaskedCardNumber = $"•••• •••• •••• {lastFour}",
                LastFourDigits = lastFour,
                CardType = app.SelectedCardType,
                CreditLimit = creditLimit,
                AvailableBalance = creditLimit,
                ExpiryMonth = (byte)DateTime.UtcNow.Month,
                ExpiryYear = (short)(DateTime.UtcNow.Year + 5),
                CardStatus = CardStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Cards.AddAsync(card, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            app.IssuedCardId = card.Id;
            app.IssuedCard = card;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapApplicationToResponse(app);
    }

    private static ApplicationResponse MapApplicationToResponse(CreditCardApplication app)
    {
        var docs = new Dictionary<string, string>();
        if (!string.IsNullOrEmpty(app.IdentityDocName)) docs["identity"] = app.IdentityDocName;
        if (!string.IsNullOrEmpty(app.AddressDocName)) docs["address"] = app.AddressDocName;
        if (!string.IsNullOrEmpty(app.IncomeDocName)) docs["income"] = app.IncomeDocName;
        if (!string.IsNullOrEmpty(app.PhotoDocName)) docs["photo"] = app.PhotoDocName;
        if (!string.IsNullOrEmpty(app.OtherDocName)) docs["other"] = app.OtherDocName;

        var stageNames = new[]
        {
            "Application submitted",
            "Documents verified",
            "Credit assessment",
            "Application review",
            "Decision",
            "Card issued"
        };

        var stageName = app.CurrentStage == 5
            ? (app.IsRejected ? "Rejected" : "Approved")
            : (app.CurrentStage >= 1 && app.CurrentStage <= stageNames.Length ? stageNames[app.CurrentStage - 1] : "In Progress");

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
            StageName = stageName,
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
