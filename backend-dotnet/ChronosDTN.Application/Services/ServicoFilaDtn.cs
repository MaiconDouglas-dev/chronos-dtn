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
    public class ServicoFilaDtn : IServicoFilaDtn
    {
        private readonly IChronosDtnDbContext _context;

        public ServicoFilaDtn(IChronosDtnDbContext context)
        {
            _context = context;
        }

        private static long ObterTempoAtualEmMicrossegundos()
        {
            return (DateTime.UtcNow.Ticks - DateTime.UnixEpoch.Ticks) / 10;
        }

        public async Task<IEnumerable<PacoteDtnDto>> ObterFilaAsync()
        {
            var pacotes = await _context.PacotesDtn
                .Include(p => p.Operador)
                .Where(p => p.StatusTransmissao == "ENQUEUED")
                .ToListAsync();

            return pacotes.Select(p => new PacoteDtnDto
            {
                Id = p.Id,
                Payload = p.Payload,
                NoOrigemId = p.NoOrigemId,
                NoDestinoId = p.NoDestinoId,
                OperadorId = p.OperadorId,
                OperadorNome = p.Operador?.Nome ?? "Desconhecido",
                Tamanho = p.Tamanho,
                TempoCriacaoUs = p.TempoCriacaoUs,
                TempoExpiracaoUs = p.TempoExpiracaoUs,
                StatusTransmissao = p.StatusTransmissao
            });
        }

        public async Task<PacoteDtnDto> EnfileirarAsync(EnfileirarPacoteDto dto)
        {
            var op = await _context.Operadores.FindAsync(dto.OperadorId);
            if (op == null)
            {
                throw new KeyNotFoundException($"Operador com ID {dto.OperadorId} não encontrado.");
            }

            var tempoAtual = ObterTempoAtualEmMicrossegundos();

            var pacote = new PacoteDtn
            {
                Payload = dto.Payload,
                NoOrigemId = dto.NoOrigemId,
                NoDestinoId = dto.NoDestinoId,
                OperadorId = dto.OperadorId,
                Tamanho = dto.Tamanho,
                TempoCriacaoUs = tempoAtual,
                TempoExpiracaoUs = dto.TempoExpiracaoUs,
                StatusTransmissao = "ENQUEUED"
            };

            _context.PacotesDtn.Add(pacote);
            await _context.SaveChangesAsync();

            var auditoria = new TransacaoAuditada
            {
                PacoteId = pacote.Id,
                OperadorId = dto.OperadorId,
                Acao = "ENQUEUE",
                TimestampUs = tempoAtual,
                Detalhes = $"Pacote enfileirado. Tamanho: {dto.Tamanho} bytes. Origem: {dto.NoOrigemId}, Destino: {dto.NoDestinoId}"
            };

            _context.TransacoesAuditadas.Add(auditoria);
            await _context.SaveChangesAsync();

            return new PacoteDtnDto
            {
                Id = pacote.Id,
                Payload = pacote.Payload,
                NoOrigemId = pacote.NoOrigemId,
                NoDestinoId = pacote.NoDestinoId,
                OperadorId = pacote.OperadorId,
                OperadorNome = op.Nome,
                Tamanho = pacote.Tamanho,
                TempoCriacaoUs = pacote.TempoCriacaoUs,
                TempoExpiracaoUs = pacote.TempoExpiracaoUs,
                StatusTransmissao = pacote.StatusTransmissao
            };
        }

        public async Task<PacoteDtnDto?> DesenfileirarAsync(long id)
        {
            var pacote = await _context.PacotesDtn
                .Include(p => p.Operador)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pacote == null || pacote.StatusTransmissao != "ENQUEUED")
            {
                return null;
            }

            var tempoAtual = ObterTempoAtualEmMicrossegundos();

            pacote.StatusTransmissao = "DEQUEUED";

            var auditoria = new TransacaoAuditada
            {
                PacoteId = pacote.Id,
                OperadorId = pacote.OperadorId,
                Acao = "DEQUEUE",
                TimestampUs = tempoAtual,
                Detalhes = "Pacote desenfileirado da fila."
            };

            _context.TransacoesAuditadas.Add(auditoria);
            await _context.SaveChangesAsync();

            return new PacoteDtnDto
            {
                Id = pacote.Id,
                Payload = pacote.Payload,
                NoOrigemId = pacote.NoOrigemId,
                NoDestinoId = pacote.NoDestinoId,
                OperadorId = pacote.OperadorId,
                OperadorNome = pacote.Operador?.Nome ?? "Desconhecido",
                Tamanho = pacote.Tamanho,
                TempoCriacaoUs = pacote.TempoCriacaoUs,
                TempoExpiracaoUs = pacote.TempoExpiracaoUs,
                StatusTransmissao = pacote.StatusTransmissao
            };
        }
    }
}
