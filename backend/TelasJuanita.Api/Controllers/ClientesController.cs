using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _clienteService;

    public ClientesController(IClienteService clienteService)
    {
        _clienteService = clienteService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? buscar)
    {
        var clientes = await _clienteService.ListarClientesAsync(buscar);
        return Ok(clientes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var cliente = await _clienteService.ObtenerPorIdAsync(id);
        if (cliente == null)
        {
            return NotFound(new { mensaje = "Cliente no encontrado" });
        }
        return Ok(cliente);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] CrearClienteDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (exito, error, cliente) = await _clienteService.RegistrarClienteAsync(dto);
        if (!exito)
        {
            return Conflict(new { mensaje = error });
        }

        return CreatedAtAction(nameof(ObtenerPorId), new { id = cliente!.IdCliente }, cliente);
    }
}
