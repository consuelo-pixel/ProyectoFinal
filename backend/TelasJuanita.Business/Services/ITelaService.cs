using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface ITelaService
{
    Task<List<TelaDto>> ListarTelasAsync(string? estado = null, string? buscar = null);
    Task<TelaDto?> ObtenerPorIdAsync(int id);
    Task<(bool Exito, string? Error, TelaDto? Tela)> RegistrarTelaAsync(CrearTelaDto dto);
    Task<(bool Exito, string? Error)> CambiarEstadoAsync(int id, string nuevoEstado);
    Task<(bool Exito, string? Error)> AjustarInventarioAsync(AjustarInventarioDto dto, Guid idUsuario);
}
