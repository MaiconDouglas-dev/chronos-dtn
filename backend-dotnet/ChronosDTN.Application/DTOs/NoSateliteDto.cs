namespace ChronosDTN.Application.DTOs
{
    public class NoSateliteDto
    {
        public long Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string EnderecoIp { get; set; } = string.Empty;
        public int Porta { get; set; }
        public string Status { get; set; } = string.Empty;
        public long CriadoEmUs { get; set; }
        public long AtualizadoEmUs { get; set; }
    }
}
