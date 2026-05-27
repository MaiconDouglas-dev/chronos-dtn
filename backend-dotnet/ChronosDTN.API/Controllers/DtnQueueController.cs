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
    public class DtnQueueController : ControllerBase
    {
        private readonly IDtnQueueService _queueService;

        public DtnQueueController(IDtnQueueService queueService)
        {
            _queueService = queueService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DtnPackageDto>>> GetQueue()
        {
            var queue = await _queueService.GetQueueAsync();
            return Ok(queue);
        }

        [HttpPost("enqueue")]
        public async Task<ActionResult<DtnPackageDto>> Enqueue([FromBody] EnqueuePackageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var enqueuedPackage = await _queueService.EnqueueAsync(dto);
            return Ok(enqueuedPackage);
        }

        [HttpPost("dequeue/{id}")]
        public async Task<ActionResult<DtnPackageDto>> Dequeue(long id)
        {
            var dequeuedPackage = await _queueService.DequeueAsync(id);
            if (dequeuedPackage == null)
            {
                return NotFound(new { Error = $"Enqueued DTN package with ID {id} not found." });
            }
            return Ok(dequeuedPackage);
        }
    }
}
