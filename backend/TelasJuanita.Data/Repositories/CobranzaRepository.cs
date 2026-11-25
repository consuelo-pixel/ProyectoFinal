using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public class CobranzaRepository : ICobranzaRepository
{
    private readonly TelasJuanitaDbContext _context;

    public CobranzaRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Venta>> ObtenerCuentasPendientesAsync(string? buscar = null)
    {
        var query = _context.Ventas
            .Include(v => v.Cliente)
            .Where(v => v.EsCredito && v.SaldoPendiente > 0 && v.Estado == "REGISTRADA")
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var b = buscar.Trim().ToLower();
            query = query.Where(v =>
                (v.Cliente != null && v.Cliente.Nombre.ToLower().Contains(b)) ||
                (v.Cliente != null && v.Cliente.Carnet.ToLower().Contains(b)));
        }

        return await query.OrderBy(v => v.Fecha).ToListAsync();
    }

    public async Task<Venta?> ObtenerVentaConClienteAsync(int idVenta)
    {
        return await _context.Ventas
            .Include(v => v.Cliente)
            .FirstOrDefaultAsync(v => v.IdVenta == idVenta);
    }

    // OJO: el saldo de la venta lo descuenta solo la base de datos (trigger fn_aplicar_abono),
    // por eso acá solo se guarda el abono.
    public async Task<Abono> RegistrarAbonoAsync(Abono abono)
    {
        _context.Abonos.Add(abono);
        await _context.SaveChangesAsync();
        return abono;
    }

    public async Task<List<Abono>> ObtenerHistorialAbonosVentaAsync(int idVenta)
    {
        return await _context.Abonos
            .Include(a => a.Usuario)
            .Include(a => a.Venta)
                .ThenInclude(v => v.Cliente)
            .Where(a => a.IdVenta == idVenta)
            .OrderByDescending(a => a.Fecha)
            .ToListAsync();
    }
}
