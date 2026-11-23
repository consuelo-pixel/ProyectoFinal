using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public interface ICobranzaRepository
{
    Task<List<Venta>> ObtenerCuentasPendientesAsync(string? buscar = null);
    Task<Venta?> ObtenerVentaConClienteAsync(int idVenta);
    Task<Abono> RegistrarAbonoAsync(Abono abono);
    Task ActualizarSaldoVentaAsync(int idVenta, decimal nuevoSaldo);
    Task<List<Abono>> ObtenerHistorialAbonosVentaAsync(int idVenta);
}
