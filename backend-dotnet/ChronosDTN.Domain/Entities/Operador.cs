using System.Collections.Generic;

namespace ChronosDTN.Domain.Entities
{
    public class Operador
    {
        public long Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string CodigoRegistro { get; set; } = string.Empty;

        // Relacionamento 1:N com PacoteDtn
        public ICollection<PacoteDtn> PacotesDtn { get; set; } = new List<PacoteDtn>();
    }
}
