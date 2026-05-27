using ChronosDTN.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Interfaces
{
    public interface IDtnQueueService
    {
        Task<IEnumerable<DtnPackageDto>> GetQueueAsync();
        Task<DtnPackageDto> EnqueueAsync(EnqueuePackageDto dto);
        Task<DtnPackageDto?> DequeueAsync(long id);
    }
}
