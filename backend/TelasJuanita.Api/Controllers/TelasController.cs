using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelasController : ControllerBase
{
    private readonly ITelaService _telaService;

    public TelasController(ITelaService telaService)
    {
        _telaService = telaService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? estado, [FromQuery] string? buscar)
    {
        var telas = await _telaService.ListarTelasAsync(estado, buscar);
        return Ok(telas);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var tela = await _telaService.ObtenerPorIdAsync(id);
        if (tela == null)
        {
            return NotFound(new { mensaje = "Tela no encontrada" });
        }
        return Ok(tela);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] CrearTelaDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (exito, error, tela) = await _telaService.RegistrarTelaAsync(dto);
        if (!exito)
        {
            return Conflict(new { mensaje = error });
        }

        return CreatedAtAction(nameof(ObtenerPorId), new { id = tela!.IdTela }, tela);
    }

    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest request)
    {
        var (exito, error) = await _telaService.CambiarEstadoAsync(id, request.Estado);
        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new { mensaje = $"Estado de la tela actualizado a '{request.Estado}'" });
    }

    [HttpPost("ajuste")]
    public async Task<IActionResult> AjustarInventario([FromBody] AjustarInventarioDto dto)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var idUsuario = Guid.TryParse(userIdClaim, out var guid) ? guid : Guid.Parse("00000000-0000-0000-0000-000000000001");

        var (exito, error) = await _telaService.AjustarInventarioAsync(dto, idUsuario);
        if (!exito)
        {
            return BadRequest(new { mensaje = error });
        }

        return Ok(new { mensaje = "Ajuste de inventario registrado con éxito." });
    }
}

public class CambiarEstadoRequest
{
    public string Estado { get; set; } = "ACTIVA";
}
