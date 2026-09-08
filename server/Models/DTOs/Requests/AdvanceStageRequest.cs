namespace MeridianCredit.API.Models.DTOs.Requests;

public class AdvanceStageRequest
{
    public int? TargetStage { get; set; }
    public bool? ForceReject { get; set; }
    public string? RejectionReason { get; set; }
}
