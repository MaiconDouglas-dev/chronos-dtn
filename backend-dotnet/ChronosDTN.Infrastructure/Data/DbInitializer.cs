using ChronosDTN.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ChronosDTN.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(ChronosDtnDbContext context)
        {
            // Aplica as migrações pendentes automaticamente ao iniciar
            await context.Database.MigrateAsync();

            // Semeia Operadores
            if (!await context.Operadores.AnyAsync())
            {
                var operadores = new[]
                {
                    new Operador { Nome = "NASA Space Operations", CodigoRegistro = "NASA" },
                    new Operador { Nome = "ESA Operations", CodigoRegistro = "ESA" },
                    new Operador { Nome = "JAXA Space Control", CodigoRegistro = "JAXA" },
                    new Operador { Nome = "INPE Satellite Center", CodigoRegistro = "INPE" }
                };

                await context.Operadores.AddRangeAsync(operadores);
                await context.SaveChangesAsync();
            }

            // Semeia Nós de Satélites
            if (!await context.NosSatelites.AnyAsync())
            {
                var tempoAtual = (DateTime.UtcNow.Ticks - DateTime.UnixEpoch.Ticks) / 10;
                var nos = new[]
                {
                    new NoSatelite
                    {
                        Nome = "SGDC-1 (Geostationary)",
                        EnderecoIp = "192.168.10.1",
                        Porta = 8081,
                        Status = "Ativo",
                        CriadoEmUs = tempoAtual,
                        AtualizadoEmUs = tempoAtual
                    },
                    new NoSatelite
                    {
                        Nome = "ISS (Space Station)",
                        EnderecoIp = "192.168.10.2",
                        Porta = 8082,
                        Status = "Ativo",
                        CriadoEmUs = tempoAtual,
                        AtualizadoEmUs = tempoAtual
                    },
                    new NoSatelite
                    {
                        Nome = "SCD-2 (Low Orbit)",
                        EnderecoIp = "192.168.10.3",
                        Porta = 8083,
                        Status = "Ativo",
                        CriadoEmUs = tempoAtual,
                        AtualizadoEmUs = tempoAtual
                    }
                };

                await context.NosSatelites.AddRangeAsync(nos);
                await context.SaveChangesAsync();
            }
        }
    }
}
