using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly TelasJuanitaDbContext _context;

    public VentaRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<Venta> RegistrarVentaAsync(Venta venta, List<DetalleVenta> detalles, Pago? pago)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();

            foreach (var det in detalles)
            {
                det.IdVenta = venta.IdVenta;
                _context.DetallesVenta.Add(det);

                // Disminuir existencias del rollo si se especificó
                if (det.IdRollo.HasValue)
                {
                    var rollo = await _context.Rollos.FindAsync(det.IdRollo.Value);
                    if (rollo != null)
                    {
                        rollo.MetrosDisponibles = Math.Max(0, rollo.MetrosDisponibles - det.CantidadMetros);
                    }
                }
                else
                {
                    // Si no se especificó rollo particular, descontar del primer rollo disponible de la tela
                    var rolloDisponible = await _context.Rollos
                        .Where(r => r.IdTela == det.IdTela && r.MetrosDisponibles > 0)
                        .OrderBy(r => r.FechaIngreso)
                        .FirstOrDefaultAsync();

                    if (rolloDisponible != null)
                    {
                        rolloDisponible.MetrosDisponibles = Math.Max(0, rolloDisponible.MetrosDisponibles - det.CantidadMetros);
                        det.IdRollo = rolloDisponible.IdRollo;
                    }
                }
            }

            if (pago != null)
            {
                pago.IdVenta = venta.IdVenta;
                _context.Pagos.Add(pago);
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return await ObtenerVentaConDetallesAsync(venta.IdVenta) ?? venta;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<Venta?> ObtenerVentaConDetallesAsync(int idVenta)
    {
        return await _context.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Usuario)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Tela)
            .Include(v => v.Pagos)
            .FirstOrDefaultAsync(v => v.IdVenta == idVenta);
    }

    public async Task<List<Venta>> ListarVentasRecientesAsync(int limite = 50)
    {
        return await _context.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Usuario)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Tela)
            .Include(v => v.Pagos)
            .OrderByDescending(v => v.Fecha)
            .Take(limite)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<bool> AnularVentaAsync(int idVenta, string motivo, Guid idUsuarioAnulacion)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var venta = await _context.Ventas
                .Include(v => v.Detalles)
                .FirstOrDefaultAsync(v => v.IdVenta == idVenta);

            if (venta == null || venta.Estado == "ANULADA")
            {
                return false;
            }

            venta.Estado = "ANULADA";
            venta.MotivoAnulacion = motivo;
            venta.FechaAnulacion = DateTime.UtcNow;
            venta.IdUsuarioAnulacion = idUsuarioAnulacion;

            // Reponer metros a los rollos (RF-12/RF-13)
            foreach (var det in venta.Detalles)
            {
                if (det.IdRollo.HasValue)
                {
                    var rollo = await _context.Rollos.FindAsync(det.IdRollo.Value);
                    if (rollo != null)
                    {
                        rollo.MetrosDisponibles += det.CantidadMetros;
                    }
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return true;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<Devolucion> RegistrarDevolucionAsync(Devolucion devolucion)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Devoluciones.Add(devolucion);

            var detalle = await _context.DetallesVenta.FindAsync(devolucion.IdDetalleVenta);
            if (detalle != null && detalle.IdRollo.HasValue)
            {
                var rollo = await _context.Rollos.FindAsync(detalle.IdRollo.Value);
                if (rollo != null)
                {
                    rollo.MetrosDisponibles += devolucion.CantidadMetros;
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return devolucion;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}
