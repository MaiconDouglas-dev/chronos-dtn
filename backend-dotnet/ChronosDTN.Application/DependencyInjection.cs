using ChronosDTN.Application.Interfaces;
using ChronosDTN.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ChronosDTN.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<ISatelliteNodeService, SatelliteNodeService>();
            services.AddScoped<IDtnQueueService, DtnQueueService>();
            return services;
        }
    }
}
