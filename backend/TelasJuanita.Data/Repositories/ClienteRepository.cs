using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly TelasJuanitaDbContext _context;

    public ClienteRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Cliente>> ObtenerTodosAsync(string? terminoBusqueda = null)
    {
        var query = _context.Clientes.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(terminoBusqueda))
        {
            var t = terminoBusqueda.Trim().ToLower();
            query = query.Where(c =>
                c.Nombre.ToLower().Contains(t) ||
                c.Carnet.ToLower().Contains(t) ||
                (c.Nit != null && c.Nit.ToLower().Contains(t)));
        }

        return await query.OrderBy(c => c.Nombre).ToListAsync();
    }

    public async Task<Cliente?> ObtenerPorIdAsync(int id)
    {
        return await _context.Clientes.FindAsync(id);
    }

    public async Task<Cliente?> ObtenerPorCarnetAsync(string carnet)
    {
        return await _context.Clientes
            .FirstOrDefaultAsync(c => c.Carnet.ToLower() == carnet.Trim().ToLower());
    }

    public async Task<Cliente> CrearAsync(Cliente cliente)
    {
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();
        return cliente;
    }

    public async Task<bool> ExisteCarnetAsync(string carnet, int? idExcluir = null)
    {
        return await _context.Clientes.AnyAsync(c =>
            c.Carnet.ToLower() == carnet.Trim().ToLower() &&
            (!idExcluir.HasValue || c.IdCliente != idExcluir.Value));
    }
}
