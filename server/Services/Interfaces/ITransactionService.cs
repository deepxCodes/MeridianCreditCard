using MeridianCredit.API.Models.DTOs.Responses;

namespace MeridianCredit.API.Services.Interfaces;

public interface ITransactionService
{
    Task<IReadOnlyList<TransactionDto>> GetCustomerTransactionsAsync(int customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TransactionDto>> GetMerchantTransactionsAsync(int merchantUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TransactionDto>> GetAllTransactionsAsync(CancellationToken cancellationToken = default);
    Task<TransactionDto?> GetTransactionByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<byte[]> GetReceiptPdfAsync(int transactionId, CancellationToken cancellationToken = default);
}
