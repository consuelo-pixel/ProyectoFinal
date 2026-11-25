using Microsoft.EntityFrameworkCore;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Data;

namespace TelasJuanita.Business.Services;

public class ReporteService : IReporteService
{
    private readonly TelasJuanitaDbContext _context;

    public ReporteService(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<ResumenVentasPeriodoDto> ObtenerReporteVentasAsync(DateTime? desde = null, DateTime? hasta = null)
    {
        var fDesde = desde ?? DateTime.UtcNow.AddDays(-30);
        var fHasta = hasta ?? DateTime.UtcNow;

        var ventas = await _context.Ventas
            .Include(v => v.Detalles)
            .Include(v => v.Pagos)
            .Where(v => v.Fecha >= fDesde && v.Fecha <= fHasta && v.Estado == "REGISTRADA")
            .AsNoTracking()
            .ToListAsync();

        decimal totalMonto = ventas.Sum(v => v.Total);
        int cantidad = ventas.Count;
        decimal totalMetros = ventas.Sum(v => v.Detalles.Sum(d => d.CantidadMetros));

        decimal efectivo = ventas.SelectMany(v => v.Pagos).Where(p => p.MetodoPago == "EFECTIVO").Sum(p => p.Monto);
        decimal qr = ventas.SelectMany(v => v.Pagos).Where(p => p.MetodoPago == "QR").Sum(p => p.Monto);
        decimal trans = ventas.SelectMany(v => v.Pagos).Where(p => p.MetodoPago == "TRANSFERENCIA").Sum(p => p.Monto);
        decimal credito = ventas.Where(v => v.EsCredito).Sum(v => v.Total);

        return new ResumenVentasPeriodoDto
        {
            FechaInicio = fDesde,
            FechaFin = fHasta,
            TotalVentasMonto = totalMonto,
            CantidadNotasEmitidas = cantidad,
            TotalEfectivo = efectivo,
            TotalQr = qr,
            TotalTransferencia = trans,
            TotalCreditoEmitido = credito,
            TotalMetrosVendidos = totalMetros,
            TicketPromedio = cantidad > 0 ? Math.Round(totalMonto / cantidad, 2) : 0m
        };
    }

    public async Task<List<RotacionTelaDto>> ObtenerReporteRotacionAsync()
    {
        var telas = await _context.Telas
            .Include(t => t.Rollos)
            .AsNoTracking()
            .ToListAsync();

        var hace30Dias = DateTime.UtcNow.AddDays(-30);

        var detallesRecientes = await _context.DetallesVenta
            .Include(d => d.Venta)
            .Where(d => d.Venta.Fecha >= hace30Dias && d.Venta.Estado == "REGISTRADA")
            .AsNoTracking()
            .ToListAsync();

        var resultado = new List<RotacionTelaDto>();

        foreach (var tela in telas)
        {
            var ventasTela = detallesRecientes.Where(d => d.IdTela == tela.IdTela).ToList();
            decimal metrosVendidos = ventasTela.Sum(d => d.CantidadMetros);
            decimal montoGenerado = ventasTela.Sum(d => d.Subtotal);
            decimal metrosDisponibles = tela.Rollos.Sum(r => r.MetrosDisponibles);

            string nivel;
            string sugerencia;

            if (metrosVendidos >= 50m)
            {
                nivel = "ALTA";
                sugerencia = "Tela de alta demanda. Mantener stock mínimo y solicitar rollos con anticipación.";
            }
            else if (metrosVendidos >= 15m)
            {
                nivel = "MEDIA";
                sugerencia = "Demanda moderada estable. Reabastecer según rotación habitual.";
            }
            else
            {
                nivel = "ESTANCADA";
                sugerencia = "Bajo movimiento. Sugerencia: promover en vitrina frontal o aplicar descuento de liquidación.";
            }

            resultado.Add(new RotacionTelaDto
            {
                IdTela = tela.IdTela,
                Codigo = tela.Codigo,
                Nombre = tela.Nombre,
                Color = tela.Color ?? "Surtido",
                MetrosVendidos = metrosVendidos,
                MontoGenerado = montoGenerado,
                MetrosDisponibles = metrosDisponibles,
                NivelRotacion = nivel,
                SugerenciaComercial = sugerencia
            });
        }

        return resultado.OrderByDescending(r => r.MetrosVendidos).ToList();
    }

    public async Task<ReporteGeneralDto> ObtenerReporteGeneralAsync()
    {
        var ventas = await ObtenerReporteVentasAsync();
        var rotacion = await ObtenerReporteRotacionAsync();

        return new ReporteGeneralDto
        {
            VentasPeriodo = ventas,
            RotacionTelas = rotacion
        };
    }
}
