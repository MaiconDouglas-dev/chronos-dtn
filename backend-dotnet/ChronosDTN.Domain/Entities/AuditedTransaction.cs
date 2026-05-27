namespace ChronosDTN.Domain.Entities
{
    public class AuditedTransaction
    {
        public long Id { get; set; }
        public long PackageId { get; set; }
        public long OperatorId { get; set; }
        public string Action { get; set; } = string.Empty; // E.g., ENQUEUE, DEQUEUE, EXPIRE, AUDIT
        public long TimestampUs { get; set; } // Microsecond timestamp
        public string Details { get; set; } = string.Empty;
    }
}
