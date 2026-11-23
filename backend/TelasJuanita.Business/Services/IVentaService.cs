using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface IVentaService
{
    Task<(bool Exito, string? Error, NotaVentaDto? Nota)> RegistrarVentaAsync(RegistrarVentaDto dto, Guid idUsuario, string nombreUsuario);
    Task<List<NotaVentaDto>> ListarVentasRecientesAsync(int limite = 50);
    Task<NotaVentaDto?> ObtenerNotaVentaAsync(int idVenta);
    Task<(bool Exito, string? Error)> AnularVentaAsync(AnularVentaDto dto, Guid idUsuario, string rolUsuario);
    Task<(bool Exito, string? Error)> RegistrarDevolucionAsync(RegistrarDevolucionDto dto, Guid idUsuario);
}
