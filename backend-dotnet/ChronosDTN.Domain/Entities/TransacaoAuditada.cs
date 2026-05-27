namespace ChronosDTN.Domain.Entities
{
    public class TransacaoAuditada
    {
        public long Id { get; set; }
        public long PacoteId { get; set; }
        public long OperadorId { get; set; }
        public string Acao { get; set; } = string.Empty; // Ex: ENQUEUE, DEQUEUE, EXPIRE, AUDIT
        public long TimestampUs { get; set; } // Timestamp em microssegundos
        public string Detalhes { get; set; } = string.Empty;
    }
}
