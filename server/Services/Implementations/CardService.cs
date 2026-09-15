using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;
using MeridianCredit.API.Models.Entities;
using MeridianCredit.API.Services.Interfaces;

namespace MeridianCredit.API.Services.Implementations;

public class CardService : ICardService
{
    private readonly MeridianCreditDbContext _dbContext;

    public CardService(MeridianCreditDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<CardDto>> GetCustomerCardsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var cards = await _dbContext.Cards
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return cards.Select(MapToDto).ToList();
    }

    public async Task<CardDto> AddCardAsync(int userId, AddCardRequest request, CancellationToken cancellationToken = default)
    {
        var cleanCardNum = request.CardNumber.Replace(" ", "").Replace("-", "");
        var last4 = cleanCardNum.Length >= 4 ? cleanCardNum[^4..] : "0000";
        var first4 = cleanCardNum.Length >= 4 ? cleanCardNum[..4] : "4111";
        var masked = $"{first4}********{last4}";

        var card = new Card
        {
            UserId = userId,
            CardHolderName = request.CardHolderName.ToUpperInvariant(),
            MaskedCardNumber = masked,
            LastFourDigits = last4,
            ExpiryMonth = request.ExpiryMonth,
            ExpiryYear = request.ExpiryYear,
            AvailableBalance = request.InitialSimulatedBalance,
            CardStatus = CardStatus.Active
        };

        await _dbContext.Cards.AddAsync(card, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(card);
    }

    public async Task<CardDto> UpdateCardStatusAsync(int userId, int cardId, CardStatus status, CancellationToken cancellationToken = default)
    {
        var card = await _dbContext.Cards
            .FirstOrDefaultAsync(c => c.Id == cardId && (userId == 0 || c.UserId == userId), cancellationToken);

        if (card == null)
        {
            throw new KeyNotFoundException("Card not found.");
        }

        card.CardStatus = status;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(card);
    }

    public async Task DeleteCardAsync(int userId, int cardId, CancellationToken cancellationToken = default)
    {
        var card = await _dbContext.Cards
            .FirstOrDefaultAsync(c => c.Id == cardId && (userId == 0 || c.UserId == userId), cancellationToken);

        if (card == null)
        {
            throw new KeyNotFoundException("Card not found.");
        }

        card.IsDeleted = true;
        card.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static CardDto MapToDto(Card card)
    {
        return new CardDto
        {
            Id = card.Id,
            UserId = card.UserId,
            CardHolderName = card.CardHolderName,
            MaskedCardNumber = card.MaskedCardNumber,
            LastFourDigits = card.LastFourDigits,
            ExpiryMonth = card.ExpiryMonth,
            ExpiryYear = card.ExpiryYear,
            AvailableBalance = card.AvailableBalance,
            CardStatus = card.CardStatus,
            CreatedAt = card.CreatedAt
        };
    }
}
