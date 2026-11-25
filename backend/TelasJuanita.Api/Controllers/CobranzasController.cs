using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Authorize(Roles = "Dueña,Vendedor")]
[Route("api/[controller]")]
public class CobranzasController : ControllerBase
{
    private readonly ICobranzaService _cobranzaService;

    public CobranzasController(ICobranzaService cobranzaService)
    {
        _cobranzaService = cobranzaService;
    }

    [HttpGet("pendientes")]
    public async Task<IActionResult> ObtenerCuentasPendientes([FromQuery] string? buscar)
    {
        var cuentas = await _cobranzaService.ObtenerCuentasPendientesAsync(buscar);
        return Ok(cuentas);
    }

    [HttpPost("abono")]
    public async Task<IActionResult> RegistrarAbono([FromBody] RegistrarAbonoDto dto)
    {
        var (exito, error, comprobante) = await _cobranzaService.RegistrarAbonoAsync(dto, User.ObtenerId(), User.ObtenerNombre());

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new
        {
            mensaje = "Abono registrado con éxito.",
            comprobante
        });
    }

    [HttpGet("historial/{idVenta:int}")]
    public async Task<IActionResult> ObtenerHistorial(int idVenta)
    {
        var historial = await _cobranzaService.ObtenerHistorialAbonosAsync(idVenta);
        return Ok(historial);
    }
}
