using MeridianCredit.API.Models.DTOs.Responses;

namespace MeridianCredit.API.Services.Interfaces;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalMerchants { get; set; }
    public int TotalTransactions { get; set; }
    public decimal TotalVolumeAmount { get; set; }
    public int TotalApprovedTransactions { get; set; }
    public int TotalDeclinedTransactions { get; set; }
    public int TotalFraudLogsCount { get; set; }
    public int PendingFraudLogsCount { get; set; }
    public double ApprovalRatePercentage { get; set; }
}

public interface IAdminService
{
    Task<IReadOnlyList<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MerchantProfileDto>> GetAllMerchantsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FraudLogDto>> GetFraudLogsAsync(CancellationToken cancellationToken = default);
    Task ResolveFraudLogAsync(int fraudLogId, string adminName, CancellationToken cancellationToken = default);
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApplicationResponse>> GetAllApplicationsAsync(CancellationToken cancellationToken = default);
    Task<ApplicationResponse> UpdateApplicationStageAsync(int applicationId, int stage, bool? isRejected, string? reason, CancellationToken cancellationToken = default);
}
