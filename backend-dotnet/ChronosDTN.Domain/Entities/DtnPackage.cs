namespace ChronosDTN.Domain.Entities
{
    public class DtnPackage
    {
        public long Id { get; set; }
        public string Payload { get; set; } = string.Empty;
        public long SourceNodeId { get; set; }
        public long DestinationNodeId { get; set; }
        public long OperatorId { get; set; }
        public long Size { get; set; }
        
        // Microsecond timestamp columns (using long)
        public long CreationTimeUs { get; set; }
        public long ExpirationTimeUs { get; set; }
        
        public string Status { get; set; } = string.Empty;

        // Navigation properties
        public Operator? Operator { get; set; }
    }
}
