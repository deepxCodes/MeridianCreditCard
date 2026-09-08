using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.ServicesInternal.Pdf;

public class PdfReceiptGenerator : IPdfReceiptGenerator
{
    static PdfReceiptGenerator()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateTransactionReceipt(Transaction transaction)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A5);
                page.Margin(20);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(column =>
                    {
                        column.Item().Text("Meridian Credit Gateway").Bold().FontSize(20).FontColor(Colors.Blue.Darken2);
                        column.Item().Text("Simulated Credit Card Payment Receipt").FontSize(10).FontColor(Colors.Grey.Darken1);
                    });
                });

                page.Content().PaddingVertical(10).Column(col =>
                {
                    col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    col.Item().PaddingTop(10).Text($"Receipt Ref: {transaction.TransactionReference}").Bold().FontSize(12);
                    col.Item().Text($"Date & Time: {transaction.ProcessedAt:yyyy-MM-dd HH:mm:ss UTC}").FontSize(10);
                    col.Item().PaddingTop(10);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(3);
                        });

                        table.Cell().Text("Customer Name:").Bold();
                        table.Cell().Text(transaction.Customer?.FullName ?? "N/A");

                        table.Cell().Text("Merchant Name:").Bold();
                        table.Cell().Text(transaction.Merchant?.BusinessName ?? "N/A");

                        table.Cell().Text("Card Number:").Bold();
                        table.Cell().Text(transaction.Card?.MaskedCardNumber ?? "N/A");

                        table.Cell().Text("Payment Status:").Bold();
                        table.Cell().Text(transaction.TransactionStatus.ToString()).Bold().FontColor(
                            transaction.TransactionStatus == Enums.TransactionStatus.Approved ? Colors.Green.Medium : Colors.Red.Medium
                        );

                        table.Cell().Text("Gateway Response:").Bold();
                        table.Cell().Text(transaction.GatewayResponse);

                        if (!string.IsNullOrEmpty(transaction.FailureReason))
                        {
                            table.Cell().Text("Failure Reason:").Bold();
                            table.Cell().Text(transaction.FailureReason);
                        }
                    });

                    col.Item().PaddingTop(15).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().Text("Total Amount Paid:").Bold().FontSize(14);
                        row.RelativeItem().AlignRight().Text($"₹ {transaction.Amount:N2} {transaction.Currency}").Bold().FontSize(16).FontColor(Colors.Blue.Darken2);
                    });
                });

                page.Footer().AlignCenter().Text("Thank you for using Meridian Credit Simulated Payment Gateway.").FontSize(9).FontColor(Colors.Grey.Darken1);
            });
        }).GeneratePdf();
    }
}
