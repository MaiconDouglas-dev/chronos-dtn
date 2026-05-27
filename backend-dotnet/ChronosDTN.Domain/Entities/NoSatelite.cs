namespace ChronosDTN.Domain.Entities
{
    public class NoSatelite
    {
        public long Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string EnderecoIp { get; set; } = string.Empty;
        public int Porta { get; set; }
        public string Status { get; set; } = string.Empty; // Active, Inactive, etc.
        
        // Timestamps em microssegundos (usando long)
        public long CriadoEmUs { get; set; }
        public long AtualizadoEmUs { get; set; }
    }
}
