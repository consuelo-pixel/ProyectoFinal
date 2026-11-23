using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var idUsuario = Guid.TryParse(userIdClaim, out var guid) ? guid : Guid.Parse("00000000-0000-0000-0000-000000000001");
        var nombreUsuario = User.FindFirst(ClaimTypes.Name)?.Value ?? "Cajera / Vendedora";

        var (exito, error, comprobante) = await _cobranzaService.RegistrarAbonoAsync(dto, idUsuario, nombreUsuario);

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
