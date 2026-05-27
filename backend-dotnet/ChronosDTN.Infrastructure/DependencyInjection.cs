using ChronosDTN.Application.Interfaces;
using ChronosDTN.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChronosDTN.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? "Data Source=ChronosDTN.db";

            services.AddDbContext<ChronosDtnDbContext>(options =>
                options.UseSqlite(connectionString));

            services.AddScoped<IChronosDtnDbContext>(provider => 
                provider.GetRequiredService<ChronosDtnDbContext>());

            return services;
        }
    }
}
