using Microsoft.EntityFrameworkCore;

namespace TelasJuanita.Data.Repositories;

public class SaludRepository : ISaludRepository
{
    private readonly TelasJuanitaDbContext _context;

    public SaludRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Conecto, string? Error)> ProbarConexionAsync()
    {
        try
        {
            var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            await conn.CloseAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
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
