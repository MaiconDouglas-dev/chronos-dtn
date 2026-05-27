using System.Collections.Generic;

namespace ChronosDTN.Domain.Entities
{
    public class Operator
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;

        // 1:N relationship with DtnPackage
        public ICollection<DtnPackage> DtnPackages { get; set; } = new List<DtnPackage>();
    }
}
