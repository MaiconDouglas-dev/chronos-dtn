using ChronosDTN.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Interfaces
{
    public interface IServicoFilaDtn
    {
        Task<IEnumerable<PacoteDtnDto>> ObterFilaAsync();
        Task<PacoteDtnDto> EnfileirarAsync(EnfileirarPacoteDto dto);
        Task<PacoteDtnDto?> DesenfileirarAsync(long id);
    }
}
