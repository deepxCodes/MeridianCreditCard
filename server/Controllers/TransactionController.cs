using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet("my-transactions")]
    public async Task<IActionResult> GetMyTransactions(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var txns = await _transactionService.GetCustomerTransactionsAsync(userId, cancellationToken);
        return Ok(txns);
    }

    [HttpGet("merchant")]
    public async Task<IActionResult> GetMerchantTransactions(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var txns = await _transactionService.GetMerchantTransactionsAsync(userId, cancellationToken);
        return Ok(txns);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllTransactions(CancellationToken cancellationToken)
    {
        var txns = await _transactionService.GetAllTransactionsAsync(cancellationToken);
        return Ok(txns);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var txn = await _transactionService.GetTransactionByIdAsync(id, cancellationToken);
        if (txn == null) return NotFound();
        return Ok(txn);
    }

    [HttpGet("{id:int}/receipt")]
    public async Task<IActionResult> DownloadReceipt(int id, CancellationToken cancellationToken)
    {
        try
        {
            var pdfBytes = await _transactionService.GetReceiptPdfAsync(id, cancellationToken);
            return File(pdfBytes, "application/pdf", $"MeridianCredit_Receipt_{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
