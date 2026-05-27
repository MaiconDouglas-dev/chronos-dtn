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
            // Apply pending migrations automatically on startup
            await context.Database.MigrateAsync();

            // Seed Operators
            if (!await context.Operators.AnyAsync())
            {
                var operators = new[]
                {
                    new Operator { Name = "NASA Space Operations", Code = "NASA" },
                    new Operator { Name = "ESA Operations", Code = "ESA" },
                    new Operator { Name = "JAXA Space Control", Code = "JAXA" },
                    new Operator { Name = "INPE Satellite Center", Code = "INPE" }
                };

                await context.Operators.AddRangeAsync(operators);
                await context.SaveChangesAsync();
            }

            // Seed Satellite Nodes
            if (!await context.SatelliteNodes.AnyAsync())
            {
                var currentTime = (DateTime.UtcNow.Ticks - DateTime.UnixEpoch.Ticks) / 10;
                var nodes = new[]
                {
                    new SatelliteNode
                    {
                        Name = "SGDC-1 (Geostationary)",
                        IpAddress = "192.168.10.1",
                        Port = 8081,
                        Status = "Active",
                        CreatedAtUs = currentTime,
                        UpdatedAtUs = currentTime
                    },
                    new SatelliteNode
                    {
                        Name = "ISS (Space Station)",
                        IpAddress = "192.168.10.2",
                        Port = 8082,
                        Status = "Active",
                        CreatedAtUs = currentTime,
                        UpdatedAtUs = currentTime
                    },
                    new SatelliteNode
                    {
                        Name = "SCD-2 (Low Orbit)",
                        IpAddress = "192.168.10.3",
                        Port = 8083,
                        Status = "Active",
                        CreatedAtUs = currentTime,
                        UpdatedAtUs = currentTime
                    }
                };

                await context.SatelliteNodes.AddRangeAsync(nodes);
                await context.SaveChangesAsync();
            }
        }
    }
}
