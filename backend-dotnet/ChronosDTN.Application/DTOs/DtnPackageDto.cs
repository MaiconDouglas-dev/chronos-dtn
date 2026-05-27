namespace ChronosDTN.Application.DTOs
{
    public class DtnPackageDto
    {
        public long Id { get; set; }
        public string Payload { get; set; } = string.Empty;
        public long SourceNodeId { get; set; }
        public long DestinationNodeId { get; set; }
        public long OperatorId { get; set; }
        public string OperatorName { get; set; } = string.Empty;
        public long Size { get; set; }
        public long CreationTimeUs { get; set; }
        public long ExpirationTimeUs { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
