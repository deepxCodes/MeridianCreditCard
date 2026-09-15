using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CardController : ControllerBase
{
    private readonly ICardService _cardService;

    public CardController(ICardService cardService)
    {
        _cardService = cardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCards(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cards = await _cardService.GetCustomerCardsAsync(userId, cancellationToken);
        return Ok(cards);
    }

    [HttpPost]
    public async Task<IActionResult> AddCard([FromBody] AddCardRequest request, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var card = await _cardService.AddCardAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetMyCards), new { id = card.Id }, card);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateCardStatus(int id, [FromBody] CardStatus status, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        // If Admin, pass userId=0 to bypass customer ownership check
        var targetUserId = role == "Admin" ? 0 : userId;

        try
        {
            var updated = await _cardService.UpdateCardStatusAsync(targetUserId, id, status, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCard(int id, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var targetUserId = role == "Admin" ? 0 : userId;

        try
        {
            await _cardService.DeleteCardAsync(targetUserId, id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
