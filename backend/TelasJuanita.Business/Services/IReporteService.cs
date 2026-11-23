using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface IReporteService
{
    Task<ResumenVentasPeriodoDto> ObtenerReporteVentasAsync(DateTime? desde = null, DateTime? hasta = null);
    Task<List<RotacionTelaDto>> ObtenerReporteRotacionAsync();
    Task<ReporteGeneralDto> ObtenerReporteGeneralAsync();
}
