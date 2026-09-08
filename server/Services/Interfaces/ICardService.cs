using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;

namespace MeridianCredit.API.Services.Interfaces;

public interface ICardService
{
    Task<IReadOnlyList<CardDto>> GetCustomerCardsAsync(int userId, CancellationToken cancellationToken = default);
    Task<CardDto> AddCardAsync(int userId, AddCardRequest request, CancellationToken cancellationToken = default);
    Task<CardDto> UpdateCardStatusAsync(int userId, int cardId, CardStatus status, CancellationToken cancellationToken = default);
    Task DeleteCardAsync(int userId, int cardId, CancellationToken cancellationToken = default);
}
