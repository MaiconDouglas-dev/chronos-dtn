namespace ChronosDTN.Application.DTOs
{
    public class PacoteDtnDto
    {
        public long Id { get; set; }
        public string Payload { get; set; } = string.Empty;
        public long NoOrigemId { get; set; }
        public long NoDestinoId { get; set; }
        public long OperadorId { get; set; }
        public string OperadorNome { get; set; } = string.Empty;
        public long Tamanho { get; set; }
        public long TempoCriacaoUs { get; set; }
        public long TempoExpiracaoUs { get; set; }
        public string StatusTransmissao { get; set; } = string.Empty;
    }
}
