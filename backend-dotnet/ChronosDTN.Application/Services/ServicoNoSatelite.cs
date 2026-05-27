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
    public class ServicoNoSatelite : IServicoNoSatelite
    {
        private readonly IChronosDtnDbContext _context;

        public ServicoNoSatelite(IChronosDtnDbContext context)
        {
            _context = context;
        }

        private static long ObterTempoAtualEmMicrossegundos()
        {
            return (DateTime.UtcNow.Ticks - DateTime.UnixEpoch.Ticks) / 10;
        }

        public async Task<IEnumerable<NoSateliteDto>> ObterTodosAsync()
        {
            var nos = await _context.NosSatelites.ToListAsync();
            return nos.Select(n => new NoSateliteDto
            {
                Id = n.Id,
                Nome = n.Nome,
                EnderecoIp = n.EnderecoIp,
                Porta = n.Porta,
                Status = n.Status,
                CriadoEmUs = n.CriadoEmUs,
                AtualizadoEmUs = n.AtualizadoEmUs
            });
        }

        public async Task<NoSateliteDto?> ObterPorIdAsync(long id)
        {
            var no = await _context.NosSatelites.FindAsync(id);
            if (no == null) return null;

            return new NoSateliteDto
            {
                Id = no.Id,
                Nome = no.Nome,
                EnderecoIp = no.EnderecoIp,
                Porta = no.Porta,
                Status = no.Status,
                CriadoEmUs = no.CriadoEmUs,
                AtualizadoEmUs = no.AtualizadoEmUs
            };
        }

        public async Task<NoSateliteDto> CriarAsync(CriarNoSateliteDto dto)
        {
            var tempoAtual = ObterTempoAtualEmMicrossegundos();
            var no = new NoSatelite
            {
                Nome = dto.Nome,
                EnderecoIp = dto.EnderecoIp,
                Porta = dto.Porta,
                Status = dto.Status,
                CriadoEmUs = tempoAtual,
                AtualizadoEmUs = tempoAtual
            };

            _context.NosSatelites.Add(no);
            await _context.SaveChangesAsync();

            return new NoSateliteDto
            {
                Id = no.Id,
                Nome = no.Nome,
                EnderecoIp = no.EnderecoIp,
                Porta = no.Porta,
                Status = no.Status,
                CriadoEmUs = no.CriadoEmUs,
                AtualizadoEmUs = no.AtualizadoEmUs
            };
        }

        public async Task<NoSateliteDto?> AtualizarAsync(long id, AtualizarNoSateliteDto dto)
        {
            var no = await _context.NosSatelites.FindAsync(id);
            if (no == null) return null;

            no.Nome = dto.Nome;
            no.EnderecoIp = dto.EnderecoIp;
            no.Porta = dto.Porta;
            no.Status = dto.Status;
            no.AtualizadoEmUs = ObterTempoAtualEmMicrossegundos();

            await _context.SaveChangesAsync();

            return new NoSateliteDto
            {
                Id = no.Id,
                Nome = no.Nome,
                EnderecoIp = no.EnderecoIp,
                Porta = no.Porta,
                Status = no.Status,
                CriadoEmUs = no.CriadoEmUs,
                AtualizadoEmUs = no.AtualizadoEmUs
            };
        }

        public async Task<bool> ExcluirAsync(long id)
        {
            var no = await _context.NosSatelites.FindAsync(id);
            if (no == null) return false;

            _context.NosSatelites.Remove(no);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
