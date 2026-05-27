namespace ChronosDTN.Domain.Entities
{
    public class PacoteDtn
    {
        public long Id { get; set; }
        public string Payload { get; set; } = string.Empty;
        public long NoOrigemId { get; set; }
        public long NoDestinoId { get; set; }
        public long OperadorId { get; set; }
        public long Tamanho { get; set; }
        
        // Timestamps em microssegundos (usando long)
        public long TempoCriacaoUs { get; set; }
        public long TempoExpiracaoUs { get; set; }
        
        public string StatusTransmissao { get; set; } = string.Empty;

        // Propriedade de navegação
        public Operador? Operador { get; set; }
    }
}
