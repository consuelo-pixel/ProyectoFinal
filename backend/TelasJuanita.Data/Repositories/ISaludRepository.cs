namespace TelasJuanita.Data.Repositories;

public interface ISaludRepository
{
    Task<(bool Conecto, string? Error)> ProbarConexionAsync();
    Task<int> ObtenerTotalRolesAsync();
    Task<int> ObtenerTotalUsuariosAsync();
}
