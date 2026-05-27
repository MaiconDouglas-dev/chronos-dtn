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

        public DbSet<Operador> Operadores => Set<Operador>();
        public DbSet<NoSatelite> NosSatelites => Set<NoSatelite>();
        public DbSet<PacoteDtn> PacotesDtn => Set<PacoteDtn>();
        public DbSet<TransacaoAuditada> TransacoesAuditadas => Set<TransacaoAuditada>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Operador (OPERADORAS_AERO)
            modelBuilder.Entity<Operador>(entity =>
            {
                entity.ToTable("OPERADORAS_AERO");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Nome).HasColumnName("NOME").IsRequired().HasMaxLength(150);
                entity.Property(e => e.CodigoRegistro).HasColumnName("CODIGO").IsRequired().HasMaxLength(50);
            });

            // NoSatelite (NOS_SATELLITES)
            modelBuilder.Entity<NoSatelite>(entity =>
            {
                entity.ToTable("NOS_SATELLITES");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Nome).HasColumnName("NOME").IsRequired().HasMaxLength(150);
                entity.Property(e => e.EnderecoIp).HasColumnName("ENDERECO_IP").IsRequired().HasMaxLength(50);
                entity.Property(e => e.Porta).HasColumnName("PORTA").IsRequired();
                entity.Property(e => e.Status).HasColumnName("STATUS").IsRequired().HasMaxLength(50);
                entity.Property(e => e.CriadoEmUs).HasColumnName("CRIADO_EM").IsRequired();
                entity.Property(e => e.AtualizadoEmUs).HasColumnName("ATUALIZADO_EM").IsRequired();
            });

            // PacoteDtn (FILA_PACOTES_DTN)
            modelBuilder.Entity<PacoteDtn>(entity =>
            {
                entity.ToTable("FILA_PACOTES_DTN");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Payload).HasColumnName("PAYLOAD").IsRequired();
                entity.Property(e => e.NoOrigemId).HasColumnName("NO_ORIGEM_ID").IsRequired();
                entity.Property(e => e.NoDestinoId).HasColumnName("NO_DESTINO_ID").IsRequired();
                entity.Property(e => e.OperadorId).HasColumnName("OPERADORA_ID").IsRequired();
                entity.Property(e => e.Tamanho).HasColumnName("TAMANHO").IsRequired();
                entity.Property(e => e.TempoCriacaoUs).HasColumnName("DATA_CRIACAO").IsRequired();
                entity.Property(e => e.TempoExpiracaoUs).HasColumnName("DATA_EXPIRACAO").IsRequired();
                entity.Property(e => e.StatusTransmissao).HasColumnName("STATUS").IsRequired().HasMaxLength(50);

                // Relacionamento 1:N entre Operador e PacoteDtn
                entity.HasOne(d => d.Operador)
                    .WithMany(o => o.PacotesDtn)
                    .HasForeignKey(d => d.OperadorId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // TransacaoAuditada (TRANSACOES_AUDITADAS)
            modelBuilder.Entity<TransacaoAuditada>(entity =>
            {
                entity.ToTable("TRANSACOES_AUDITADAS");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.PacoteId).HasColumnName("PACOTE_ID").IsRequired();
                entity.Property(e => e.OperadorId).HasColumnName("OPERADORA_ID").IsRequired();
                entity.Property(e => e.Acao).HasColumnName("ACAO").IsRequired().HasMaxLength(50);
                entity.Property(e => e.TimestampUs).HasColumnName("DATA_HORA").IsRequired();
                entity.Property(e => e.Detalhes).HasColumnName("DETALHES").HasMaxLength(1000);
            });
        }
    }
}
