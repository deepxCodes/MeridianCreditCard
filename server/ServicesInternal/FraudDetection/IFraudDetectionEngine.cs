using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.ServicesInternal.FraudDetection;

public class FraudEvaluationResult
{
    public bool IsFraudulent { get; set; }
    public FraudSeverity Severity { get; set; } = FraudSeverity.Low;
    public string Reason { get; set; } = string.Empty;
    public bool ShouldBlockTransaction { get; set; }
}

public interface IFraudDetectionEngine
{
    Task<FraudEvaluationResult> EvaluateTransactionAsync(
        int customerId,
        int cardId,
        decimal amount,
        Card card,
        CancellationToken cancellationToken = default);
}
