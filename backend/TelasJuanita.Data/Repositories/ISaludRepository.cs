namespace TelasJuanita.Data.Repositories;

public interface ISaludRepository
{
    Task<bool> PuedeConectarAsync();
    Task<int> ObtenerTotalRolesAsync();
    Task<int> ObtenerTotalUsuariosAsync();
}
