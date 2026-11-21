using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public interface IClienteRepository
{
    Task<List<Cliente>> ObtenerTodosAsync(string? terminoBusqueda = null);
    Task<Cliente?> ObtenerPorIdAsync(int id);
    Task<Cliente?> ObtenerPorCarnetAsync(string carnet);
    Task<Cliente> CrearAsync(Cliente cliente);
    Task<bool> ExisteCarnetAsync(string carnet, int? idExcluir = null);
}
