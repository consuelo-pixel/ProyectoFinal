using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var resultado = await _authService.IniciarSesionAsync(dto);

        if (!resultado.Exito)
        {
            if (resultado.CuentaBloqueada)
            {
                return StatusCode(StatusCodes.Status423Locked, resultado);
            }
            return Unauthorized(resultado);
        }

        return Ok(resultado);
    }

    [HttpPost("desbloquear")]
    public async Task<IActionResult> Desbloquear([FromQuery] string correo)
    {
        var ok = await _authService.DesbloquearUsuarioAsync(correo);
        if (!ok)
        {
            return NotFound(new { mensaje = "Usuario no encontrado" });
        }
        return Ok(new { mensaje = $"Usuario '{correo}' desbloqueado e intentos reiniciados a 0" });
    }
}
