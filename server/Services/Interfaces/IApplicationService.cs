using MeridianCredit.API.Models.DTOs.Requests;
using MeridianCredit.API.Models.DTOs.Responses;

namespace MeridianCredit.API.Services.Interfaces;

public interface IApplicationService
{
    Task<ApplicationResponse> SubmitApplicationAsync(int userId, CreateApplicationRequest request, CancellationToken cancellationToken = default);
    Task<ApplicationResponse?> GetCurrentApplicationAsync(int userId, CancellationToken cancellationToken = default);
    Task<ApplicationResponse> AdvanceStageAsync(int userId, AdvanceStageRequest request, CancellationToken cancellationToken = default);
    Task<string> UploadDocumentAsync(int userId, string docType, IFormFile file, CancellationToken cancellationToken = default);
}
