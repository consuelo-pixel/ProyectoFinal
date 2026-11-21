using TelasJuanita.Business.DTOs;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class ClienteService : IClienteService
{
    private readonly IClienteRepository _clienteRepo;

    public ClienteService(IClienteRepository clienteRepo)
    {
        _clienteRepo = clienteRepo;
    }

    public async Task<List<ClienteDto>> ListarClientesAsync(string? buscar = null)
    {
        var clientes = await _clienteRepo.ObtenerTodosAsync(buscar);
        return clientes.Select(c => new ClienteDto
        {
            IdCliente = c.IdCliente,
            Nombre = c.Nombre,
            Carnet = c.Carnet,
            Nit = c.Nit,
            Telefono = c.Telefono,
            Direccion = c.Direccion,
            LimiteCredito = c.LimiteCredito,
            Estado = c.Estado
        }).ToList();
    }

    public async Task<ClienteDto?> ObtenerPorIdAsync(int id)
    {
        var c = await _clienteRepo.ObtenerPorIdAsync(id);
        if (c == null) return null;

        return new ClienteDto
        {
            IdCliente = c.IdCliente,
            Nombre = c.Nombre,
            Carnet = c.Carnet,
            Nit = c.Nit,
            Telefono = c.Telefono,
            Direccion = c.Direccion,
            LimiteCredito = c.LimiteCredito,
            Estado = c.Estado
        };
    }

    public async Task<(bool Exito, string? Error, ClienteDto? Cliente)> RegistrarClienteAsync(CrearClienteDto dto)
    {
        if (await _clienteRepo.ExisteCarnetAsync(dto.Carnet))
        {
            return (false, $"Ya existe un cliente registrado con el carnet '{dto.Carnet}'", null);
        }

        var entidad = new Cliente
        {
            Nombre = dto.Nombre.Trim(),
            Carnet = dto.Carnet.Trim(),
            Nit = string.IsNullOrWhiteSpace(dto.Nit) ? null : dto.Nit.Trim(),
            Telefono = string.IsNullOrWhiteSpace(dto.Telefono) ? null : dto.Telefono.Trim(),
            Direccion = string.IsNullOrWhiteSpace(dto.Direccion) ? null : dto.Direccion.Trim(),
            LimiteCredito = dto.LimiteCredito,
            Estado = "ACTIVO"
        };

        var creado = await _clienteRepo.CrearAsync(entidad);

        var clienteDto = new ClienteDto
        {
            IdCliente = creado.IdCliente,
            Nombre = creado.Nombre,
            Carnet = creado.Carnet,
            Nit = creado.Nit,
            Telefono = creado.Telefono,
            Direccion = creado.Direccion,
            LimiteCredito = creado.LimiteCredito,
            Estado = creado.Estado
        };

        return (true, null, clienteDto);
    }
}
