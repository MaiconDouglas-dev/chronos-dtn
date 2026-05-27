using ChronosDTN.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Interfaces
{
    public interface IChronosDtnDbContext
    {
        DbSet<Operator> Operators { get; }
        DbSet<SatelliteNode> SatelliteNodes { get; }
        DbSet<DtnPackage> DtnPackages { get; }
        DbSet<AuditedTransaction> AuditedTransactions { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
