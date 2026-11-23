using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorCorreoAsync(string correo);
    Task<bool> ActualizarIntentosFallidosAsync(Guid idUsuario, int intentos, string? estado = null);
    Task<bool> ResetearIntentosAsync(Guid idUsuario);
}
