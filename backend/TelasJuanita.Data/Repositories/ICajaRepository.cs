using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public interface ICajaRepository
{
    Task<CierreCaja?> ObtenerCierreDelDiaAsync(DateOnly fecha);
    Task<CierreCaja> RegistrarCierreAsync(CierreCaja cierre);
    Task<List<CierreCaja>> ObtenerHistorialAsync(int limite = 30);
    Task<(decimal Efectivo, decimal Qr, decimal Transferencia, decimal Total, int Cantidad)> CalcularTotalesDiaAsync(DateOnly fecha);
}
