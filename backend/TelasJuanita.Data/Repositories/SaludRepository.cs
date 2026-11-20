using Microsoft.EntityFrameworkCore;

namespace TelasJuanita.Data.Repositories;

public class SaludRepository : ISaludRepository
{
    private readonly TelasJuanitaDbContext _context;

    public SaludRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<bool> PuedeConectarAsync()
    {
        return await _context.Database.CanConnectAsync();
    }

    public async Task<int> ObtenerTotalRolesAsync()
    {
        return await _context.Roles.CountAsync();
    }

    public async Task<int> ObtenerTotalUsuariosAsync()
    {
        return await _context.Usuarios.CountAsync();
    }
}
