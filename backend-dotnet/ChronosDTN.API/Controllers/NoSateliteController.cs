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
    [Route("api/nosatelite")]
    public class NoSateliteController : ControllerBase
    {
        private readonly IServicoNoSatelite _nodeService;

        public NoSateliteController(IServicoNoSatelite nodeService)
        {
            _nodeService = nodeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoSateliteDto>>> ObterTodos()
        {
            var nos = await _nodeService.ObterTodosAsync();
            return Ok(nos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NoSateliteDto>> ObterPorId(long id)
        {
            var no = await _nodeService.ObterPorIdAsync(id);
            if (no == null)
            {
                return NotFound(new { Error = $"Nó de satélite com ID {id} não encontrado." });
            }
            return Ok(no);
        }

        [HttpPost]
        public async Task<ActionResult<NoSateliteDto>> Criar([FromBody] CriarNoSateliteDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var noCriado = await _nodeService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = noCriado.Id }, noCriado);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NoSateliteDto>> Atualizar(long id, [FromBody] AtualizarNoSateliteDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var noAtualizado = await _nodeService.AtualizarAsync(id, dto);
            if (noAtualizado == null)
            {
                return NotFound(new { Error = $"Nó de satélite com ID {id} não encontrado." });
            }
            return Ok(noAtualizado);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(long id)
        {
            var deletado = await _nodeService.ExcluirAsync(id);
            if (!deletado)
            {
                return NotFound(new { Error = $"Nó de satélite com ID {id} não encontrado." });
            }
            return NoContent();
        }
    }
}
