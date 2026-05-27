using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChronosDTN.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private const string SecretKey = "ChronosDtnSecretKeySpaceSecurityKey123!";

        [HttpPost("token")]
        public IActionResult GenerateToken([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username))
            {
                return BadRequest(new { Error = "Username is required." });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, request.Username),
                    new Claim(ClaimTypes.Role, "Operator")
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

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
