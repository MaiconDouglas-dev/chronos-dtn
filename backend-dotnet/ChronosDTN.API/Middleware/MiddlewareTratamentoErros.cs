using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChronosDTN.API.Middleware
{
    public class MiddlewareTratamentoErros
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<MiddlewareTratamentoErros> _logger;

        public MiddlewareTratamentoErros(RequestDelegate next, ILogger<MiddlewareTratamentoErros> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu uma exceção não tratada durante a requisição.");
                await TratarExcecaoAsync(context, ex);
            }
        }

        private static Task TratarExcecaoAsync(HttpContext context, Exception excecao)
        {
            var codigo = HttpStatusCode.InternalServerError;
            var titulo = "Erro Interno do Servidor";
            var detalhe = excecao.Message;

            switch (excecao)
            {
                case KeyNotFoundException:
                    codigo = HttpStatusCode.NotFound;
                    titulo = "Recurso Não Encontrado";
                    break;
                case ArgumentException:
                case InvalidOperationException:
                    codigo = HttpStatusCode.BadRequest;
                    titulo = "Requisição Inválida";
                    break;
                case UnauthorizedAccessException:
                    codigo = HttpStatusCode.Unauthorized;
                    titulo = "Não Autorizado";
                    break;
            }

            var resposta = new
            {
                Status = (int)codigo,
                Title = titulo,
                Detail = detalhe,
                Timestamp = DateTime.UtcNow
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)codigo;

            var resultado = JsonSerializer.Serialize(resposta);
            return context.Response.WriteAsync(resultado);
        }
    }
}
