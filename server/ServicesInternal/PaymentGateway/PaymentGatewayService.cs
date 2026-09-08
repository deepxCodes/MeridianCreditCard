using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;
using MeridianCredit.API.ServicesInternal.FraudDetection;
using MeridianCredit.API.ServicesInternal.Notification;

namespace MeridianCredit.API.ServicesInternal.PaymentGateway;

public class PaymentGatewayService : IPaymentGatewayService
{
    private readonly MeridianCreditDbContext _dbContext;
    private readonly IFraudDetectionEngine _fraudEngine;
    private readonly INotificationService _notificationService;
    private readonly ILogger<PaymentGatewayService> _logger;

    public PaymentGatewayService(
        MeridianCreditDbContext dbContext,
        IFraudDetectionEngine fraudEngine,
        INotificationService notificationService,
        ILogger<PaymentGatewayService> logger)
    {
        _dbContext = dbContext;
        _fraudEngine = fraudEngine;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<ProcessPaymentResponse> ProcessPaymentAsync(
        ProcessPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var txnRef = GenerateTransactionReference();

        var card = await _dbContext.Cards
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == request.CardId && c.UserId == request.CustomerId, cancellationToken);

        var customer = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == request.CustomerId && u.Role == UserRole.Customer, cancellationToken);

        var merchant = await _dbContext.MerchantProfiles
            .FirstOrDefaultAsync(m => m.Id == request.MerchantId, cancellationToken);

        if (card == null || customer == null || merchant == null)
        {
            var failedTxn = new Transaction
            {
                TransactionReference = txnRef,
                CardId = request.CardId,
                CustomerId = request.CustomerId,
                MerchantId = request.MerchantId,
                Amount = request.Amount,
                Currency = "INR",
                TransactionStatus = TransactionStatus.Failed,
                GatewayResponse = "ERROR",
                FailureReason = "Invalid Customer, Merchant, or Card details provided.",
                ProcessedAt = DateTime.UtcNow
            };

            if (card != null && customer != null && merchant != null)
            {
                await _dbContext.Transactions.AddAsync(failedTxn, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            return new ProcessPaymentResponse
            {
                TransactionReference = txnRef,
                Status = TransactionStatus.Failed,
                GatewayResponse = "ERROR",
                FailureReason = "Invalid Customer, Merchant, or Card details provided.",
                Amount = request.Amount,
                ProcessedAt = DateTime.UtcNow
            };
        }

        // 1. Evaluate Fraud Rules
        var fraudResult = await _fraudEngine.EvaluateTransactionAsync(
            request.CustomerId, request.CardId, request.Amount, card, cancellationToken);

        if (fraudResult.ShouldBlockTransaction)
        {
            var blockedTxn = new Transaction
            {
                TransactionReference = txnRef,
                CardId = card.Id,
                CustomerId = customer.Id,
                MerchantId = merchant.Id,
                Amount = request.Amount,
                Currency = "INR",
                TransactionStatus = TransactionStatus.Declined,
                GatewayResponse = "DECLINED",
                FailureReason = $"Security Block: {fraudResult.Reason}",
                ProcessedAt = DateTime.UtcNow
            };

            await _dbContext.Transactions.AddAsync(blockedTxn, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var fraudLog = new FraudLog
            {
                TransactionId = blockedTxn.Id,
                FraudReason = fraudResult.Reason,
                Severity = fraudResult.Severity,
                IsResolved = false
            };
            await _dbContext.FraudLogs.AddAsync(fraudLog, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _notificationService.SendNotificationAsync(
                customer.Id,
                NotificationType.PaymentFailed,
                "Meridian Credit Security Alert: Transaction Declined",
                $"Your transaction of ₹{request.Amount:N2} at {merchant.BusinessName} was declined due to security policies. Reason: {fraudResult.Reason}",
                cancellationToken);

            return new ProcessPaymentResponse
            {
                TransactionId = blockedTxn.Id,
                TransactionReference = txnRef,
                Status = TransactionStatus.Declined,
                GatewayResponse = "DECLINED",
                FailureReason = $"Security Block: {fraudResult.Reason}",
                Amount = request.Amount,
                ProcessedAt = DateTime.UtcNow,
                IsFraudFlagged = true,
                FraudSeverity = fraudResult.Severity
            };
        }

        // 2. Validate Card Expiry
        var currentYear = DateTime.UtcNow.Year;
        var currentMonth = DateTime.UtcNow.Month;
        if (card.ExpiryYear < currentYear || (card.ExpiryYear == currentYear && card.ExpiryMonth < currentMonth))
        {
            card.CardStatus = CardStatus.Expired;
            var expiredTxn = new Transaction
            {
                TransactionReference = txnRef,
                CardId = card.Id,
                CustomerId = customer.Id,
                MerchantId = merchant.Id,
                Amount = request.Amount,
                Currency = "INR",
                TransactionStatus = TransactionStatus.Declined,
                GatewayResponse = "DECLINED",
                FailureReason = "Card has expired.",
                ProcessedAt = DateTime.UtcNow
            };

            await _dbContext.Transactions.AddAsync(expiredTxn, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new ProcessPaymentResponse
            {
                TransactionId = expiredTxn.Id,
                TransactionReference = txnRef,
                Status = TransactionStatus.Declined,
                GatewayResponse = "DECLINED",
                FailureReason = "Card has expired.",
                Amount = request.Amount,
                ProcessedAt = DateTime.UtcNow
            };
        }

        // 3. Validate Available Balance
        if (card.AvailableBalance < request.Amount)
        {
            var insufficientBalanceTxn = new Transaction
            {
                TransactionReference = txnRef,
                CardId = card.Id,
                CustomerId = customer.Id,
                MerchantId = merchant.Id,
                Amount = request.Amount,
                Currency = "INR",
                TransactionStatus = TransactionStatus.Declined,
                GatewayResponse = "DECLINED",
                FailureReason = "Insufficient available credit balance.",
                ProcessedAt = DateTime.UtcNow
            };

            await _dbContext.Transactions.AddAsync(insufficientBalanceTxn, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _notificationService.SendNotificationAsync(
                customer.Id,
                NotificationType.PaymentFailed,
                "Meridian Credit Alert: Transaction Declined",
                $"Your transaction of ₹{request.Amount:N2} at {merchant.BusinessName} was declined due to insufficient available balance.",
                cancellationToken);

            return new ProcessPaymentResponse
            {
                TransactionId = insufficientBalanceTxn.Id,
                TransactionReference = txnRef,
                Status = TransactionStatus.Declined,
                GatewayResponse = "DECLINED",
                FailureReason = "Insufficient available credit balance.",
                Amount = request.Amount,
                ProcessedAt = DateTime.UtcNow
            };
        }

        // 4. Approve Payment & Deduct Balance
        card.AvailableBalance -= request.Amount;

        var approvedTxn = new Transaction
        {
            TransactionReference = txnRef,
            CardId = card.Id,
            CustomerId = customer.Id,
            MerchantId = merchant.Id,
            Amount = request.Amount,
            Currency = "INR",
            TransactionStatus = TransactionStatus.Approved,
            GatewayResponse = "APPROVED",
            FailureReason = null,
            ProcessedAt = DateTime.UtcNow
        };

        await _dbContext.Transactions.AddAsync(approvedTxn, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // If fraud rule was triggered (e.g., > 50k high value), log for admin review
        if (fraudResult.IsFraudulent)
        {
            var fraudLog = new FraudLog
            {
                TransactionId = approvedTxn.Id,
                FraudReason = fraudResult.Reason,
                Severity = fraudResult.Severity,
                IsResolved = false
            };
            await _dbContext.FraudLogs.AddAsync(fraudLog, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // Send Approval Notification
        await _notificationService.SendNotificationAsync(
            customer.Id,
            NotificationType.PaymentSuccess,
            "Meridian Credit Transaction Approved",
            $"Payment of ₹{request.Amount:N2} to {merchant.BusinessName} was successful. Txn Ref: {txnRef}",
            cancellationToken);

        _logger.LogInformation("TRANSACTION APPROVED: Ref {TxnRef}, Amount ₹{Amount:N2}, Card *{Last4}",
            txnRef, request.Amount, card.LastFourDigits);

        return new ProcessPaymentResponse
        {
            TransactionId = approvedTxn.Id,
            TransactionReference = txnRef,
            Status = TransactionStatus.Approved,
            GatewayResponse = "APPROVED",
            FailureReason = null,
            Amount = request.Amount,
            Currency = "INR",
            ProcessedAt = approvedTxn.ProcessedAt,
            IsFraudFlagged = fraudResult.IsFraudulent,
            FraudSeverity = fraudResult.IsFraudulent ? fraudResult.Severity : null
        };
    }

    private static string GenerateTransactionReference()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");
        var randomDigit = Random.Shared.Next(1000, 9999);
        return $"TXN{timestamp}{randomDigit}";
    }
}
