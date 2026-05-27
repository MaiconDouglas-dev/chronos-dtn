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
    public class DtnQueueService : IDtnQueueService
    {
        private readonly IChronosDtnDbContext _context;

        public DtnQueueService(IChronosDtnDbContext context)
        {
            _context = context;
        }

        private static long GetCurrentTimeInMicroseconds()
        {
            return (DateTime.UtcNow.Ticks - DateTime.UnixEpoch.Ticks) / 10;
        }

        public async Task<IEnumerable<DtnPackageDto>> GetQueueAsync()
        {
            var packages = await _context.DtnPackages
                .Include(p => p.Operator)
                .Where(p => p.Status == "ENQUEUED")
                .ToListAsync();

            return packages.Select(p => new DtnPackageDto
            {
                Id = p.Id,
                Payload = p.Payload,
                SourceNodeId = p.SourceNodeId,
                DestinationNodeId = p.DestinationNodeId,
                OperatorId = p.OperatorId,
                OperatorName = p.Operator?.Name ?? "Unknown",
                Size = p.Size,
                CreationTimeUs = p.CreationTimeUs,
                ExpirationTimeUs = p.ExpirationTimeUs,
                Status = p.Status
            });
        }

        public async Task<DtnPackageDto> EnqueueAsync(EnqueuePackageDto dto)
        {
            var op = await _context.Operators.FindAsync(dto.OperatorId);
            if (op == null)
            {
                throw new KeyNotFoundException($"Operator with ID {dto.OperatorId} not found.");
            }

            var currentTime = GetCurrentTimeInMicroseconds();

            var package = new DtnPackage
            {
                Payload = dto.Payload,
                SourceNodeId = dto.SourceNodeId,
                DestinationNodeId = dto.DestinationNodeId,
                OperatorId = dto.OperatorId,
                Size = dto.Size,
                CreationTimeUs = currentTime,
                ExpirationTimeUs = dto.ExpirationTimeUs,
                Status = "ENQUEUED"
            };

            _context.DtnPackages.Add(package);
            await _context.SaveChangesAsync();

            var audit = new AuditedTransaction
            {
                PackageId = package.Id,
                OperatorId = dto.OperatorId,
                Action = "ENQUEUE",
                TimestampUs = currentTime,
                Details = $"Package enqueued. Size: {dto.Size} bytes. Source: {dto.SourceNodeId}, Destination: {dto.DestinationNodeId}"
            };

            _context.AuditedTransactions.Add(audit);
            await _context.SaveChangesAsync();

            return new DtnPackageDto
            {
                Id = package.Id,
                Payload = package.Payload,
                SourceNodeId = package.SourceNodeId,
                DestinationNodeId = package.DestinationNodeId,
                OperatorId = package.OperatorId,
                OperatorName = op.Name,
                Size = package.Size,
                CreationTimeUs = package.CreationTimeUs,
                ExpirationTimeUs = package.ExpirationTimeUs,
                Status = package.Status
            };
        }

        public async Task<DtnPackageDto?> DequeueAsync(long id)
        {
            var package = await _context.DtnPackages
                .Include(p => p.Operator)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (package == null || package.Status != "ENQUEUED")
            {
                return null;
            }

            var currentTime = GetCurrentTimeInMicroseconds();

            package.Status = "DEQUEUED";

            var audit = new AuditedTransaction
            {
                PackageId = package.Id,
                OperatorId = package.OperatorId,
                Action = "DEQUEUE",
                TimestampUs = currentTime,
                Details = "Package dequeued from the queue."
            };

            _context.AuditedTransactions.Add(audit);
            await _context.SaveChangesAsync();

            return new DtnPackageDto
            {
                Id = package.Id,
                Payload = package.Payload,
                SourceNodeId = package.SourceNodeId,
                DestinationNodeId = package.DestinationNodeId,
                OperatorId = package.OperatorId,
                OperatorName = package.Operator?.Name ?? "Unknown",
                Size = package.Size,
                CreationTimeUs = package.CreationTimeUs,
                ExpirationTimeUs = package.ExpirationTimeUs,
                Status = package.Status
            };
        }
    }
}
