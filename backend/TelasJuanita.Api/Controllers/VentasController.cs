using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var idUsuario = Guid.TryParse(userIdClaim, out var guid) ? guid : Guid.Parse("00000000-0000-0000-0000-000000000001");
        var nombreUsuario = User.FindFirst(ClaimTypes.Name)?.Value ?? "Vendedora";

        var (exito, error, nota) = await _ventaService.RegistrarVentaAsync(dto, idUsuario, nombreUsuario);

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

    [HttpPost("anular")]
    public async Task<IActionResult> Anular([FromBody] AnularVentaDto dto, [FromHeader(Name = "X-Rol-Usuario")] string? rolHeader)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var idUsuario = Guid.TryParse(userIdClaim, out var guid) ? guid : Guid.Parse("00000000-0000-0000-0000-000000000001");
        
        // Obtener rol del claim o del header de simulación de rol
        var rol = User.FindFirst(ClaimTypes.Role)?.Value ?? rolHeader ?? "Dueña";

        var (exito, error) = await _ventaService.AnularVentaAsync(dto, idUsuario, rol);

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new { mensaje = "Venta anulada con éxito y metros restituidos al almacén." });
    }

    [HttpPost("devolucion")]
    public async Task<IActionResult> Devolucion([FromBody] RegistrarDevolucionDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var idUsuario = Guid.TryParse(userIdClaim, out var guid) ? guid : Guid.Parse("00000000-0000-0000-0000-000000000001");

        var (exito, error) = await _ventaService.RegistrarDevolucionAsync(dto, idUsuario);

        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new { mensaje = "Devolución registrada con éxito y metros restituidos al rollo." });
    }
}
