using ChronosDTN.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Interfaces
{
    public interface ISatelliteNodeService
    {
        Task<IEnumerable<SatelliteNodeDto>> GetAllAsync();
        Task<SatelliteNodeDto?> GetByIdAsync(long id);
        Task<SatelliteNodeDto> CreateAsync(CreateSatelliteNodeDto dto);
        Task<SatelliteNodeDto?> UpdateAsync(long id, UpdateSatelliteNodeDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
