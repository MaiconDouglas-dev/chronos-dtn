using System.ComponentModel.DataAnnotations;

namespace ChronosDTN.Application.DTOs
{
    public class AtualizarNoSateliteDto
    {
        [Required(ErrorMessage = "O nome do nó é obrigatório.")]
        [MaxLength(150, ErrorMessage = "O nome do nó não pode exceder 150 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O endereço IP é obrigatório.")]
        [MaxLength(50, ErrorMessage = "O endereço IP não pode exceder 50 caracteres.")]
        [RegularExpression(@"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", 
            ErrorMessage = "Formato de endereço IP inválido.")]
        public string EnderecoIp { get; set; } = string.Empty;

        [Required(ErrorMessage = "A porta é obrigatória.")]
        [Range(1, 65535, ErrorMessage = "A porta deve estar entre 1 e 65535.")]
        public int Porta { get; set; }

        [Required(ErrorMessage = "O status é obrigatório.")]
        [MaxLength(50, ErrorMessage = "O status não pode exceder 50 caracteres.")]
        public string Status { get; set; } = string.Empty;
    }
}
