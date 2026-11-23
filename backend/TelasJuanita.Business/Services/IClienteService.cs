using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface IClienteService
{
    Task<List<ClienteDto>> ListarClientesAsync(string? buscar = null);
    Task<ClienteDto?> ObtenerPorIdAsync(int id);
    Task<(bool Exito, string? Error, ClienteDto? Cliente)> RegistrarClienteAsync(CrearClienteDto dto);
}
