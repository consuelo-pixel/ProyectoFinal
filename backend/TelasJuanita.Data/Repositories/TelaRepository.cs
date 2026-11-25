using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public class TelaRepository : ITelaRepository
{
    private readonly TelasJuanitaDbContext _context;

    public TelaRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Tela>> ObtenerTodasAsync(string? estado = null, string? buscar = null)
    {
        var query = _context.Telas
            .Include(t => t.Rollos)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(t => t.Estado.ToUpper() == estado.Trim().ToUpper());
        }

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var b = buscar.Trim().ToLower();
            query = query.Where(t =>
                t.Nombre.ToLower().Contains(b) ||
                t.Codigo.ToLower().Contains(b) ||
                (t.Tipo != null && t.Tipo.ToLower().Contains(b)) ||
                (t.Color != null && t.Color.ToLower().Contains(b)));
        }

        return await query.OrderBy(t => t.Nombre).ToListAsync();
    }

    public async Task<Tela?> ObtenerPorIdAsync(int id)
    {
        return await _context.Telas
            .Include(t => t.Rollos)
            .FirstOrDefaultAsync(t => t.IdTela == id);
    }

    public async Task<Tela?> ObtenerPorCodigoAsync(string codigo)
    {
        return await _context.Telas
            .FirstOrDefaultAsync(t => t.Codigo.ToLower() == codigo.Trim().ToLower());
    }

    public async Task<Tela> CrearAsync(Tela tela)
    {
        _context.Telas.Add(tela);
        await _context.SaveChangesAsync();
        return tela;
    }

    public async Task<bool> CambiarEstadoAsync(int id, string nuevoEstado)
    {
        var tela = await _context.Telas.FindAsync(id);
        if (tela == null) return false;

        tela.Estado = nuevoEstado;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExisteCodigoAsync(string codigo, int? idExcluir = null)
    {
        return await _context.Telas.AnyAsync(t =>
            t.Codigo.ToLower() == codigo.Trim().ToLower() &&
            (!idExcluir.HasValue || t.IdTela != idExcluir.Value));
    }

    public async Task<bool> RegistrarAjusteInventarioAsync(MovimientoInventario movimiento, decimal deltaMetros)
    {
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            Rollo? rollo;

            if (movimiento.IdRollo.HasValue)
            {
                rollo = await _context.Rollos
                    .FirstOrDefaultAsync(r => r.IdRollo == movimiento.IdRollo.Value && r.IdTela == movimiento.IdTela);
            }
            else
            {
                // Sin rollo indicado se ajusta el más reciente de la tela
                rollo = await _context.Rollos
                    .Where(r => r.IdTela == movimiento.IdTela)
                    .OrderByDescending(r => r.FechaIngreso)
                    .FirstOrDefaultAsync();
            }

            if (rollo == null)
            {
                throw new InvalidOperationException("No se encontró un rollo de esa tela para ajustar.");
            }

            var nuevoDisponible = rollo.MetrosDisponibles + deltaMetros;

            if (nuevoDisponible < 0)
            {
                throw new InvalidOperationException($"El rollo solo tiene {rollo.MetrosDisponibles} metros, no se pueden descontar más.");
            }

            if (nuevoDisponible > rollo.MetrosIniciales)
            {
                throw new InvalidOperationException($"El ajuste supera los metros iniciales del rollo ({rollo.MetrosIniciales} m).");
            }

            rollo.MetrosDisponibles = nuevoDisponible;
            movimiento.IdRollo = rollo.IdRollo;
            _context.MovimientosInventario.Add(movimiento);

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
}
