using System.ComponentModel.DataAnnotations;

namespace ChronosDTN.Application.DTOs
{
    public class EnfileirarPacoteDto
    {
        [Required(ErrorMessage = "O payload é obrigatório.")]
        public string Payload { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ID do nó de origem é obrigatório.")]
        public long NoOrigemId { get; set; }

        [Required(ErrorMessage = "O ID do nó de destino é obrigatório.")]
        public long NoDestinoId { get; set; }

        [Required(ErrorMessage = "O ID do operador é obrigatório.")]
        public long OperadorId { get; set; }

        [Required(ErrorMessage = "O tamanho é obrigatório.")]
        [Range(1, long.MaxValue, ErrorMessage = "O tamanho deve ser maior que zero.")]
        public long Tamanho { get; set; }

        [Required(ErrorMessage = "O tempo de expiração (em microssegundos) é obrigatório.")]
        [Range(1, long.MaxValue, ErrorMessage = "O tempo de expiração deve ser um timestamp de microssegundos válido.")]
        public long TempoExpiracaoUs { get; set; }
    }
}
