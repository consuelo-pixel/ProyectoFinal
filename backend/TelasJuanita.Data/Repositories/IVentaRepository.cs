using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public interface IVentaRepository
{
    Task<Venta> RegistrarVentaAsync(Venta venta, List<DetalleVenta> detalles, Pago? pago);
    Task<Venta?> ObtenerVentaConDetallesAsync(int idVenta);
    Task<List<Venta>> ListarVentasRecientesAsync(int limite = 50);
    Task<bool> AnularVentaAsync(int idVenta, string motivo, Guid idUsuarioAnulacion);
    Task<Devolucion> RegistrarDevolucionAsync(Devolucion devolucion);
    Task<decimal> ObtenerDeudaClienteAsync(int idCliente);
}
