using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api;

// Crea el token JWT que el frontend manda en cada petición
public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string CrearToken(Guid idUsuario, string nombre, string correo, string rol)
    {
        var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Clave"]!));
        var horas = int.Parse(_config["Jwt:HorasDeVida"] ?? "8");

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, idUsuario.ToString()),
                new Claim(ClaimTypes.Name, nombre),
                new Claim(ClaimTypes.Email, correo),
                new Claim(ClaimTypes.Role, rol)
            }),
            Issuer = _config["Jwt:Emisor"],
            Audience = _config["Jwt:Audiencia"],
            Expires = DateTime.UtcNow.AddHours(horas),
            SigningCredentials = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256)
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}
