using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface ICobranzaService
{
    Task<List<CuentaPorCobrarDto>> ObtenerCuentasPendientesAsync(string? buscar = null);
    Task<(bool Exito, string? Error, ComprobanteAbonoDto? Comprobante)> RegistrarAbonoAsync(RegistrarAbonoDto dto, Guid idUsuario, string nombreUsuario);
    Task<List<ComprobanteAbonoDto>> ObtenerHistorialAbonosAsync(int idVenta);
}
