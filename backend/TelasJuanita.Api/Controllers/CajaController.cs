using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CajaController : ControllerBase
{
    private readonly ICajaService _cajaService;

    public CajaController(ICajaService cajaService)
    {
        _cajaService = cajaService;
    }

    [HttpGet("hoy")]
    public async Task<IActionResult> ObtenerResumenHoy()
    {
        var resumen = await _cajaService.ObtenerResumenHoyAsync();
        return Ok(resumen);
    }

    [HttpPost("cerrar")]
    public async Task<IActionResult> RealizarCierre([FromBody] RegistrarCierreCajaDto dto)
    {
        // Si hay claims de usuario se usa el ID, sino ID por defecto para compatibilidad
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var idUsuario = Guid.TryParse(userIdClaim, out var guid) ? guid : Guid.Parse("00000000-0000-0000-0000-000000000001");

        var (exito, error, cierre) = await _cajaService.RealizarCierreCajaAsync(dto, idUsuario);

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new
        {
            mensaje = "Cierre de caja realizado con éxito.",
            cierre
        });
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ListarHistorial()
    {
        var historial = await _cajaService.ListarHistorialCierresAsync();
        return Ok(historial);
    }
}
