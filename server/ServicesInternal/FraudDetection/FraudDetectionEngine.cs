using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.ServicesInternal.FraudDetection;

public class FraudDetectionEngine : IFraudDetectionEngine
{
    private readonly MeridianCreditDbContext _dbContext;

    public FraudDetectionEngine(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<FraudEvaluationResult> EvaluateTransactionAsync(
        int customerId,
        int cardId,
        decimal amount,
        Card card,
        CancellationToken cancellationToken = default)
    {
        // Rule 1: Card status is Blocked or Expired
        if (card.CardStatus == CardStatus.Blocked)
        {
            return new FraudEvaluationResult
            {
                IsFraudulent = true,
                Severity = FraudSeverity.Critical,
                Reason = "Payment attempted on a BLOCKED card.",
                ShouldBlockTransaction = true
            };
        }

        var currentYear = DateTime.UtcNow.Year;
        var currentMonth = DateTime.UtcNow.Month;
        if (card.ExpiryYear < currentYear || (card.ExpiryYear == currentYear && card.ExpiryMonth < currentMonth))
        {
            return new FraudEvaluationResult
            {
                IsFraudulent = true,
                Severity = FraudSeverity.High,
                Reason = "Payment attempted on an EXPIRED card.",
                ShouldBlockTransaction = true
            };
        }

        // Rule 2: High Amount Threshold (> ₹50,000)
        if (amount > 50000.00m)
        {
            return new FraudEvaluationResult
            {
                IsFraudulent = true,
                Severity = FraudSeverity.High,
                Reason = $"High-value transaction attempt exceeding ₹50,000 (Amount: ₹{amount:N2}).",
                ShouldBlockTransaction = false // Allow processing but flag for Admin review
            };
        }

        // Rule 3: Velocity Check - More than 5 transactions in the last 1 minute
        var oneMinuteAgo = DateTime.UtcNow.AddMinutes(-1);
        var recentTxnCount = await _dbContext.Transactions
            .CountAsync(t => t.CustomerId == customerId && t.CreatedAt >= oneMinuteAgo, cancellationToken);

        if (recentTxnCount >= 5)
        {
            return new FraudEvaluationResult
            {
                IsFraudulent = true,
                Severity = FraudSeverity.Critical,
                Reason = $"Velocity limit exceeded: {recentTxnCount + 1} transactions attempted within 60 seconds.",
                ShouldBlockTransaction = true
            };
        }

        // Rule 4: Repeated Failures Check - More than 3 declined transactions in the last 10 minutes
        var tenMinutesAgo = DateTime.UtcNow.AddMinutes(-10);
        var failedTxnCount = await _dbContext.Transactions
            .CountAsync(t => t.CardId == cardId && t.CreatedAt >= tenMinutesAgo && t.TransactionStatus == TransactionStatus.Declined, cancellationToken);

        if (failedTxnCount >= 3)
        {
            return new FraudEvaluationResult
            {
                IsFraudulent = true,
                Severity = FraudSeverity.High,
                Reason = $"Multiple failed payment attempts ({failedTxnCount}) recorded on this card within 10 minutes.",
                ShouldBlockTransaction = true
            };
        }

        return new FraudEvaluationResult
        {
            IsFraudulent = false
        };
    }
}
