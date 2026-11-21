using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly TelasJuanitaDbContext _context;

    public UsuarioRepository(TelasJuanitaDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo)
    {
        return await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.Trim().ToLower());
    }

    public async Task<bool> ActualizarIntentosFallidosAsync(Guid idUsuario, int intentos, string? estado = null)
    {
        var user = await _context.Usuarios.FindAsync(idUsuario);
        if (user == null) return false;

        user.IntentosFallidos = intentos;
        if (estado != null)
        {
            user.Estado = estado;
            if (estado == "BLOQUEADO")
            {
                user.BloqueadoHasta = DateTime.UtcNow.AddMinutes(30);
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetearIntentosAsync(Guid idUsuario)
    {
        var user = await _context.Usuarios.FindAsync(idUsuario);
        if (user == null) return false;

        user.IntentosFallidos = 0;
        user.Estado = "ACTIVO";
        user.BloqueadoHasta = null;
        user.UltimoAcceso = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
