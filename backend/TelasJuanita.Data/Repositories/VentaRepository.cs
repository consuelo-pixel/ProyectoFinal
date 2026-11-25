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
                Rollo? rollo;

                if (det.IdRollo.HasValue)
                {
                    // Se eligió un rollo: tiene que ser de esa tela
                    rollo = await _context.Rollos
                        .FirstOrDefaultAsync(r => r.IdRollo == det.IdRollo.Value && r.IdTela == det.IdTela);

                    if (rollo == null)
                    {
                        throw new InvalidOperationException("El rollo seleccionado no existe o no pertenece a esa tela.");
                    }
                }
                else
                {
                    // No se eligió rollo: buscamos el más antiguo que tenga suficientes metros
                    rollo = await _context.Rollos
                        .Where(r => r.IdTela == det.IdTela && r.MetrosDisponibles >= det.CantidadMetros)
                        .OrderBy(r => r.FechaIngreso)
                        .FirstOrDefaultAsync();

                    if (rollo == null)
                    {
                        throw new InvalidOperationException(
                            $"No hay ningún rollo con {det.CantidadMetros} metros disponibles para la tela con ID {det.IdTela}.");
                    }
                }

                // Control de stock: no se puede vender más de lo que hay en el rollo
                if (rollo.MetrosDisponibles < det.CantidadMetros)
                {
                    throw new InvalidOperationException(
                        $"El rollo {rollo.IdRollo} solo tiene {rollo.MetrosDisponibles} metros disponibles.");
                }

                rollo.MetrosDisponibles -= det.CantidadMetros;
                det.IdRollo = rollo.IdRollo;
                det.IdVenta = venta.IdVenta;
                _context.DetallesVenta.Add(det);

                // Guardamos en cada vuelta para que la siguiente línea vea el stock actualizado
                await _context.SaveChangesAsync();
            }

            if (pago != null)
            {
                pago.IdVenta = venta.IdVenta;
                _context.Pagos.Add(pago);
                await _context.SaveChangesAsync();
            }

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

            // Si ya hay abonos, anular dejaría plata sin devolver: mejor no permitirlo
            if (venta.EsCredito)
            {
                var tieneAbonos = await _context.Abonos.AnyAsync(a => a.IdVenta == idVenta);
                if (tieneAbonos)
                {
                    throw new InvalidOperationException("No se puede anular una venta a crédito que ya tiene abonos registrados.");
                }
            }

            venta.Estado = "ANULADA";
            venta.MotivoAnulacion = motivo;
            venta.FechaAnulacion = DateTime.UtcNow;
            venta.IdUsuarioAnulacion = idUsuarioAnulacion;
            venta.SaldoPendiente = 0m;

            // Devolver los metros a los rollos (menos lo que ya se había devuelto antes)
            foreach (var det in venta.Detalles)
            {
                if (!det.IdRollo.HasValue)
                {
                    continue;
                }

                var yaDevuelto = await _context.Devoluciones
                    .Where(d => d.IdDetalleVenta == det.IdDetalleVenta)
                    .SumAsync(d => d.CantidadMetros);

                var rollo = await _context.Rollos.FindAsync(det.IdRollo.Value);
                if (rollo != null)
                {
                    rollo.MetrosDisponibles += det.CantidadMetros - yaDevuelto;
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
            var detalle = await _context.DetallesVenta
                .Include(d => d.Venta)
                .FirstOrDefaultAsync(d => d.IdDetalleVenta == devolucion.IdDetalleVenta);

            if (detalle == null)
            {
                throw new InvalidOperationException("No se encontró el corte de tela que se quiere devolver.");
            }

            if (detalle.Venta.Estado == "ANULADA")
            {
                throw new InvalidOperationException("La venta está anulada, no se pueden registrar devoluciones.");
            }

            // No se puede devolver más de lo que se vendió
            var yaDevuelto = await _context.Devoluciones
                .Where(d => d.IdDetalleVenta == detalle.IdDetalleVenta)
                .SumAsync(d => d.CantidadMetros);

            var maximo = detalle.CantidadMetros - yaDevuelto;
            if (devolucion.CantidadMetros > maximo)
            {
                throw new InvalidOperationException($"Solo se pueden devolver {maximo} metros de este corte.");
            }

            devolucion.Monto = Math.Round(devolucion.CantidadMetros * detalle.PrecioUnitario, 2);
            _context.Devoluciones.Add(devolucion);

            if (detalle.IdRollo.HasValue)
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

    // Suma lo que el cliente todavía debe en sus ventas a crédito
    public async Task<decimal> ObtenerDeudaClienteAsync(int idCliente)
    {
        return await _context.Ventas
            .Where(v => v.IdCliente == idCliente && v.EsCredito && v.Estado == "REGISTRADA")
            .SumAsync(v => v.SaldoPendiente);
    }
}
