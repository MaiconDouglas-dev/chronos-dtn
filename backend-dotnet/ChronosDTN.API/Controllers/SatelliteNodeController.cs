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
    [Route("api/[controller]")]
    public class SatelliteNodeController : ControllerBase
    {
        private readonly ISatelliteNodeService _nodeService;

        public SatelliteNodeController(ISatelliteNodeService nodeService)
        {
            _nodeService = nodeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SatelliteNodeDto>>> GetAll()
        {
            var nodes = await _nodeService.GetAllAsync();
            return Ok(nodes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SatelliteNodeDto>> GetById(long id)
        {
            var node = await _nodeService.GetByIdAsync(id);
            if (node == null)
            {
                return NotFound(new { Error = $"Satellite node with ID {id} not found." });
            }
            return Ok(node);
        }

        [HttpPost]
        public async Task<ActionResult<SatelliteNodeDto>> Create([FromBody] CreateSatelliteNodeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdNode = await _nodeService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdNode.Id }, createdNode);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SatelliteNodeDto>> Update(long id, [FromBody] UpdateSatelliteNodeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedNode = await _nodeService.UpdateAsync(id, dto);
            if (updatedNode == null)
            {
                return NotFound(new { Error = $"Satellite node with ID {id} not found." });
            }
            return Ok(updatedNode);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var deleted = await _nodeService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { Error = $"Satellite node with ID {id} not found." });
            }
            return NoContent();
        }
    }
}
