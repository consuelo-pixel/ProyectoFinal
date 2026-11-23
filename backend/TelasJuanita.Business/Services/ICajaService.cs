using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface ICajaService
{
    Task<ResumenCajaHoyDto> ObtenerResumenHoyAsync();
    Task<(bool Exito, string? Error, CierreCajaHistorialDto? Cierre)> RealizarCierreCajaAsync(RegistrarCierreCajaDto dto, Guid idUsuario);
    Task<List<CierreCajaHistorialDto>> ListarHistorialCierresAsync();
}
