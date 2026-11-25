using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Authorize(Roles = "Dueña,Vendedor")]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly IVentaService _ventaService;

    public VentasController(IVentaService ventaService)
    {
        _ventaService = ventaService;
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarVentaDto dto)
    {
        var (exito, error, nota) = await _ventaService.RegistrarVentaAsync(dto, User.ObtenerId(), User.ObtenerNombre());

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(nota);
    }

    [HttpGet("recientes")]
    public async Task<IActionResult> ListarRecientes([FromQuery] int limite = 50)
    {
        var ventas = await _ventaService.ListarVentasRecientesAsync(limite);
        return Ok(ventas);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var nota = await _ventaService.ObtenerNotaVentaAsync(id);
        if (nota == null)
        {
            return NotFound(new { mensaje = $"No se encontró la venta con ID {id}" });
        }
        return Ok(nota);
    }

    // Solo la Dueña (RN-04). El rol sale del token, ya no se acepta por header.
    [Authorize(Roles = "Dueña")]
    [HttpPost("anular")]
    public async Task<IActionResult> Anular([FromBody] AnularVentaDto dto)
    {
        var (exito, error) = await _ventaService.AnularVentaAsync(dto, User.ObtenerId(), User.ObtenerRol());

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new { mensaje = "Venta anulada con éxito y metros restituidos al almacén." });
    }

    [HttpPost("devolucion")]
    public async Task<IActionResult> Devolucion([FromBody] RegistrarDevolucionDto dto)
    {
        var (exito, error) = await _ventaService.RegistrarDevolucionAsync(dto, User.ObtenerId());

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new { mensaje = "Devolución registrada con éxito y metros restituidos al rollo." });
    }
}
