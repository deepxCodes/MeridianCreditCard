using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;
using MeridianCredit.API.Services.Interfaces;
using MeridianCredit.API.ServicesInternal.Pdf;

namespace MeridianCredit.API.Services.Implementations;

public class TransactionService : ITransactionService
{
    private readonly MeridianCreditDbContext _dbContext;
    private readonly IPdfReceiptGenerator _pdfGenerator;

    public TransactionService(MeridianCreditDbContext dbContext, IPdfReceiptGenerator pdfGenerator)
    {
        _dbContext = dbContext;
        _pdfGenerator = pdfGenerator;
    }

    public async Task<IReadOnlyList<TransactionDto>> GetCustomerTransactionsAsync(int customerId, CancellationToken cancellationToken = default)
    {
        var txns = await _dbContext.Transactions
            .Include(t => t.Card)
            .Include(t => t.Customer)
            .Include(t => t.Merchant)
            .Include(t => t.FraudLog)
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.ProcessedAt)
            .ToListAsync(cancellationToken);

        return txns.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<TransactionDto>> GetMerchantTransactionsAsync(int merchantUserId, CancellationToken cancellationToken = default)
    {
        var merchantProfile = await _dbContext.MerchantProfiles
            .FirstOrDefaultAsync(m => m.UserId == merchantUserId, cancellationToken);

        if (merchantProfile == null)
        {
            return Array.Empty<TransactionDto>();
        }

        var txns = await _dbContext.Transactions
            .Include(t => t.Card)
            .Include(t => t.Customer)
            .Include(t => t.Merchant)
            .Include(t => t.FraudLog)
            .Where(t => t.MerchantId == merchantProfile.Id)
            .OrderByDescending(t => t.ProcessedAt)
            .ToListAsync(cancellationToken);

        return txns.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<TransactionDto>> GetAllTransactionsAsync(CancellationToken cancellationToken = default)
    {
        var txns = await _dbContext.Transactions
            .Include(t => t.Card)
            .Include(t => t.Customer)
            .Include(t => t.Merchant)
            .Include(t => t.FraudLog)
            .OrderByDescending(t => t.ProcessedAt)
            .ToListAsync(cancellationToken);

        return txns.Select(MapToDto).ToList();
    }

    public async Task<TransactionDto?> GetTransactionByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var txn = await _dbContext.Transactions
            .Include(t => t.Card)
            .Include(t => t.Customer)
            .Include(t => t.Merchant)
            .Include(t => t.FraudLog)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        return txn == null ? null : MapToDto(txn);
    }

    public async Task<byte[]> GetReceiptPdfAsync(int transactionId, CancellationToken cancellationToken = default)
    {
        var txn = await _dbContext.Transactions
            .Include(t => t.Card)
            .Include(t => t.Customer)
            .Include(t => t.Merchant)
            .FirstOrDefaultAsync(t => t.Id == transactionId, cancellationToken);

        if (txn == null)
        {
            throw new KeyNotFoundException("Transaction not found.");
        }

        return _pdfGenerator.GenerateTransactionReceipt(txn);
    }

    private static TransactionDto MapToDto(Transaction t)
    {
        return new TransactionDto
        {
            Id = t.Id,
            TransactionReference = t.TransactionReference,
            CardId = t.CardId,
            MaskedCardNumber = t.Card?.MaskedCardNumber ?? "N/A",
            CustomerId = t.CustomerId,
            CustomerName = t.Customer?.FullName ?? "N/A",
            MerchantId = t.MerchantId,
            BusinessName = t.Merchant?.BusinessName ?? "N/A",
            Amount = t.Amount,
            Currency = t.Currency,
            TransactionStatus = t.TransactionStatus,
            GatewayResponse = t.GatewayResponse,
            FailureReason = t.FailureReason,
            ProcessedAt = t.ProcessedAt,
            IsFraudFlagged = t.FraudLog != null
        };
    }
}
