using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Authorize(Roles = "Dueña,Vendedor")]
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
        var (exito, error, cierre) = await _cajaService.RealizarCierreCajaAsync(dto, User.ObtenerId(), User.ObtenerNombre());

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
