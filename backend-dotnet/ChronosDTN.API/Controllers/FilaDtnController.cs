using ChronosDTN.Application.DTOs;
using ChronosDTN.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChronosDTN.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/filadtn")]
    public class FilaDtnController : ControllerBase
    {
        private readonly IServicoFilaDtn _queueService;

        public FilaDtnController(IServicoFilaDtn queueService)
        {
            _queueService = queueService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PacoteDtnDto>>> ObterFila()
        {
            var fila = await _queueService.ObterFilaAsync();
            return Ok(fila);
        }

        [HttpPost("enfileirar")]
        public async Task<ActionResult<PacoteDtnDto>> Enfileirar([FromBody] EnfileirarPacoteDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var pacoteEnfileirado = await _queueService.EnfileirarAsync(dto);
            return Ok(pacoteEnfileirado);
        }

        [HttpPost("desenfileirar/{id}")]
        public async Task<ActionResult<PacoteDtnDto>> Desenfileirar(long id)
        {
            var pacoteDesenfileirado = await _queueService.DesenfileirarAsync(id);
            if (pacoteDesenfileirado == null)
            {
                return NotFound(new { Error = $"Pacote DTN enfileirado com ID {id} não encontrado." });
            }
            return Ok(pacoteDesenfileirado);
        }
    }
}
