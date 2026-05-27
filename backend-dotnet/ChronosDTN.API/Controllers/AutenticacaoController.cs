using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChronosDTN.API.Controllers
{
    [ApiController]
    [Route("api/autenticacao")]
    public class AutenticacaoController : ControllerBase
    {
        private const string SecretKey = "ChronosDtnSecretKeySpaceSecurityKey123!";

        [HttpPost("token")]
        public IActionResult GerarToken([FromBody] RequisicaoLogin requisicao)
        {
            if (string.IsNullOrEmpty(requisicao.Usuario))
            {
                return BadRequest(new { Error = "O nome de usuário é obrigatório." });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, requisicao.Usuario),
                    new Claim(ClaimTypes.Role, "Operador")
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                Issuer = "ChronosDTN.API",
                Audience = "ChronosDTN.App",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString, Expires = tokenDescriptor.Expires });
        }
    }

    public class RequisicaoLogin
    {
        public string Usuario { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}
