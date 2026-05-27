using ChronosDTN.Application.Interfaces;
using ChronosDTN.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChronosDTN.Infrastructure.Data
{
    public class ChronosDtnDbContext : DbContext, IChronosDtnDbContext
    {
        public ChronosDtnDbContext(DbContextOptions<ChronosDtnDbContext> options)
            : base(options)
        {
        }

        public DbSet<Operator> Operators => Set<Operator>();
        public DbSet<SatelliteNode> SatelliteNodes => Set<SatelliteNode>();
        public DbSet<DtnPackage> DtnPackages => Set<DtnPackage>();
        public DbSet<AuditedTransaction> AuditedTransactions => Set<AuditedTransaction>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Operators (OPERADORAS_AERO)
            modelBuilder.Entity<Operator>(entity =>
            {
                entity.ToTable("OPERADORAS_AERO");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Name).HasColumnName("NOME").IsRequired().HasMaxLength(150);
                entity.Property(e => e.Code).HasColumnName("CODIGO").IsRequired().HasMaxLength(50);
            });

            // SatelliteNodes (NOS_SATELLITES)
            modelBuilder.Entity<SatelliteNode>(entity =>
            {
                entity.ToTable("NOS_SATELLITES");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Name).HasColumnName("NOME").IsRequired().HasMaxLength(150);
                entity.Property(e => e.IpAddress).HasColumnName("ENDERECO_IP").IsRequired().HasMaxLength(50);
                entity.Property(e => e.Port).HasColumnName("PORTA").IsRequired();
                entity.Property(e => e.Status).HasColumnName("STATUS").IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAtUs).HasColumnName("CRIADO_EM").IsRequired();
                entity.Property(e => e.UpdatedAtUs).HasColumnName("ATUALIZADO_EM").IsRequired();
            });

            // DtnPackages (FILA_PACOTES_DTN)
            modelBuilder.Entity<DtnPackage>(entity =>
            {
                entity.ToTable("FILA_PACOTES_DTN");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Payload).HasColumnName("PAYLOAD").IsRequired();
                entity.Property(e => e.SourceNodeId).HasColumnName("NO_ORIGEM_ID").IsRequired();
                entity.Property(e => e.DestinationNodeId).HasColumnName("NO_DESTINO_ID").IsRequired();
                entity.Property(e => e.OperatorId).HasColumnName("OPERADORA_ID").IsRequired();
                entity.Property(e => e.Size).HasColumnName("TAMANHO").IsRequired();
                entity.Property(e => e.CreationTimeUs).HasColumnName("DATA_CRIACAO").IsRequired();
                entity.Property(e => e.ExpirationTimeUs).HasColumnName("DATA_EXPIRACAO").IsRequired();
                entity.Property(e => e.Status).HasColumnName("STATUS").IsRequired().HasMaxLength(50);

                // 1:N Relationship between Operator and DtnPackage
                entity.HasOne(d => d.Operator)
                    .WithMany(o => o.DtnPackages)
                    .HasForeignKey(d => d.OperatorId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // AuditedTransactions (TRANSACOES_AUDITADAS)
            modelBuilder.Entity<AuditedTransaction>(entity =>
            {
                entity.ToTable("TRANSACOES_AUDITADAS");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.PackageId).HasColumnName("PACOTE_ID").IsRequired();
                entity.Property(e => e.OperatorId).HasColumnName("OPERADORA_ID").IsRequired();
                entity.Property(e => e.Action).HasColumnName("ACAO").IsRequired().HasMaxLength(50);
                entity.Property(e => e.TimestampUs).HasColumnName("DATA_HORA").IsRequired();
                entity.Property(e => e.Details).HasColumnName("DETALHES").HasMaxLength(1000);
            });
        }
    }
}
