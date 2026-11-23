using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public class CajaRepository : ICajaRepository
{
    private readonly TelasJuanitaDbContext _context;

    public CajaRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<CierreCaja?> ObtenerCierreDelDiaAsync(DateOnly fecha)
    {
        return await _context.CierresCaja
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.Fecha == fecha);
    }

    public async Task<CierreCaja> RegistrarCierreAsync(CierreCaja cierre)
    {
        _context.CierresCaja.Add(cierre);
        await _context.SaveChangesAsync();
        return cierre;
    }

    public async Task<List<CierreCaja>> ObtenerHistorialAsync(int limite = 30)
    {
        return await _context.CierresCaja
            .Include(c => c.Usuario)
            .OrderByDescending(c => c.Fecha)
            .Take(limite)
            .ToListAsync();
    }

    public async Task<(decimal Efectivo, decimal Qr, decimal Transferencia, decimal Total, int Cantidad)> CalcularTotalesDiaAsync(DateOnly fecha)
    {
        // Totales de pagos directos del día
        var fechaInicio = fecha.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var fechaFin = fecha.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        var pagos = await _context.Pagos
            .Where(p => p.Fecha >= fechaInicio && p.Fecha <= fechaFin)
            .ToListAsync();

        var abonos = await _context.Abonos
            .Where(a => a.Fecha >= fechaInicio && a.Fecha <= fechaFin)
            .ToListAsync();

        decimal efectivo = pagos.Where(p => p.MetodoPago == "EFECTIVO").Sum(p => p.Monto) +
                           abonos.Where(a => a.MetodoPago == "EFECTIVO").Sum(a => a.Monto);

        decimal qr = pagos.Where(p => p.MetodoPago == "QR").Sum(p => p.Monto) +
                     abonos.Where(a => a.MetodoPago == "QR").Sum(a => a.Monto);

        decimal trans = pagos.Where(p => p.MetodoPago == "TRANSFERENCIA").Sum(p => p.Monto) +
                        abonos.Where(a => a.MetodoPago == "TRANSFERENCIA").Sum(a => a.Monto);

        decimal total = efectivo + qr + trans;
        int cantidad = pagos.Count + abonos.Count;

        return (efectivo, qr, trans, total, cantidad);
    }
}
