using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;

    public ReportesController(IReporteService reporteService)
    {
        _reporteService = reporteService;
    }

    [HttpGet("ventas")]
    public async Task<IActionResult> ObtenerReporteVentas([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
    {
        var reporte = await _reporteService.ObtenerReporteVentasAsync(desde, hasta);
        return Ok(reporte);
    }

    [HttpGet("rotacion")]
    public async Task<IActionResult> ObtenerReporteRotacion()
    {
        var rotacion = await _reporteService.ObtenerReporteRotacionAsync();
        return Ok(rotacion);
    }

    [HttpGet("general")]
    public async Task<IActionResult> ObtenerReporteGeneral()
    {
        var general = await _reporteService.ObtenerReporteGeneralAsync();
        return Ok(general);
    }
}
