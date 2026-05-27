using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChronosDTN.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
                _logger.LogError(ex, "An unhandled exception occurred during the request.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;
            var title = "Internal Server Error";
            var detail = exception.Message;

            switch (exception)
            {
                case KeyNotFoundException:
                    code = HttpStatusCode.NotFound;
                    title = "Resource Not Found";
                    break;
                case ArgumentException:
                case InvalidOperationException:
                    code = HttpStatusCode.BadRequest;
                    title = "Bad Request";
                    break;
                case UnauthorizedAccessException:
                    code = HttpStatusCode.Unauthorized;
                    title = "Unauthorized";
                    break;
            }

            var response = new
            {
                Status = (int)code,
                Title = title,
                Detail = detail,
                Timestamp = DateTime.UtcNow
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            var result = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(result);
        }
    }
}
