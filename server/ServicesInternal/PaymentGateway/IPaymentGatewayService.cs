using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;

namespace MeridianCredit.API.ServicesInternal.PaymentGateway;

public interface IPaymentGatewayService
{
    Task<ProcessPaymentResponse> ProcessPaymentAsync(
        ProcessPaymentRequest request,
        CancellationToken cancellationToken = default);
}
