using ChronosDTN.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Interfaces
{
    public interface IChronosDtnDbContext
    {
        DbSet<Operador> Operadores { get; }
        DbSet<NoSatelite> NosSatelites { get; }
        DbSet<PacoteDtn> PacotesDtn { get; }
        DbSet<TransacaoAuditada> TransacoesAuditadas { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
