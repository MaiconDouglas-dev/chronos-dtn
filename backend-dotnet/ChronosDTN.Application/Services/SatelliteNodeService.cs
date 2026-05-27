using ChronosDTN.Application.DTOs;
using ChronosDTN.Application.Interfaces;
using ChronosDTN.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChronosDTN.Application.Services
{
    public class SatelliteNodeService : ISatelliteNodeService
    {
        private readonly IChronosDtnDbContext _context;

        public SatelliteNodeService(IChronosDtnDbContext context)
        {
            _context = context;
        }

        private static long GetCurrentTimeInMicroseconds()
        {
            return (DateTime.UtcNow.Ticks - DateTime.UnixEpoch.Ticks) / 10;
        }

        public async Task<IEnumerable<SatelliteNodeDto>> GetAllAsync()
        {
            var nodes = await _context.SatelliteNodes.ToListAsync();
            return nodes.Select(n => new SatelliteNodeDto
            {
                Id = n.Id,
                Name = n.Name,
                IpAddress = n.IpAddress,
                Port = n.Port,
                Status = n.Status,
                CreatedAtUs = n.CreatedAtUs,
                UpdatedAtUs = n.UpdatedAtUs
            });
        }

        public async Task<SatelliteNodeDto?> GetByIdAsync(long id)
        {
            var node = await _context.SatelliteNodes.FindAsync(id);
            if (node == null) return null;

            return new SatelliteNodeDto
            {
                Id = node.Id,
                Name = node.Name,
                IpAddress = node.IpAddress,
                Port = node.Port,
                Status = node.Status,
                CreatedAtUs = node.CreatedAtUs,
                UpdatedAtUs = node.UpdatedAtUs
            };
        }

        public async Task<SatelliteNodeDto> CreateAsync(CreateSatelliteNodeDto dto)
        {
            var currentTime = GetCurrentTimeInMicroseconds();
            var node = new SatelliteNode
            {
                Name = dto.Name,
                IpAddress = dto.IpAddress,
                Port = dto.Port,
                Status = dto.Status,
                CreatedAtUs = currentTime,
                UpdatedAtUs = currentTime
            };

            _context.SatelliteNodes.Add(node);
            await _context.SaveChangesAsync();

            return new SatelliteNodeDto
            {
                Id = node.Id,
                Name = node.Name,
                IpAddress = node.IpAddress,
                Port = node.Port,
                Status = node.Status,
                CreatedAtUs = node.CreatedAtUs,
                UpdatedAtUs = node.UpdatedAtUs
            };
        }

        public async Task<SatelliteNodeDto?> UpdateAsync(long id, UpdateSatelliteNodeDto dto)
        {
            var node = await _context.SatelliteNodes.FindAsync(id);
            if (node == null) return null;

            node.Name = dto.Name;
            node.IpAddress = dto.IpAddress;
            node.Port = dto.Port;
            node.Status = dto.Status;
            node.UpdatedAtUs = GetCurrentTimeInMicroseconds();

            await _context.SaveChangesAsync();

            return new SatelliteNodeDto
            {
                Id = node.Id,
                Name = node.Name,
                IpAddress = node.IpAddress,
                Port = node.Port,
                Status = node.Status,
                CreatedAtUs = node.CreatedAtUs,
                UpdatedAtUs = node.UpdatedAtUs
            };
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var node = await _context.SatelliteNodes.FindAsync(id);
            if (node == null) return false;

            _context.SatelliteNodes.Remove(node);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
