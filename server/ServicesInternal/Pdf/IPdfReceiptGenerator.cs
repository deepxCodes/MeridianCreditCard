using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.ServicesInternal.Pdf;

public interface IPdfReceiptGenerator
{
    byte[] GenerateTransactionReceipt(Transaction transaction);
}
