using ChronosDTN.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Interfaces
{
    public interface IServicoNoSatelite
    {
        Task<IEnumerable<NoSateliteDto>> ObterTodosAsync();
        Task<NoSateliteDto?> ObterPorIdAsync(long id);
        Task<NoSateliteDto> CriarAsync(CriarNoSateliteDto dto);
        Task<NoSateliteDto?> AtualizarAsync(long id, AtualizarNoSateliteDto dto);
        Task<bool> ExcluirAsync(long id);
    }
}
