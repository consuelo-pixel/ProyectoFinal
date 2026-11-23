using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data.Repositories;

public interface ITelaRepository
{
    Task<List<Tela>> ObtenerTodasAsync(string? estado = null, string? buscar = null);
    Task<Tela?> ObtenerPorIdAsync(int id);
    Task<Tela?> ObtenerPorCodigoAsync(string codigo);
    Task<Tela> CrearAsync(Tela tela);
    Task<bool> CambiarEstadoAsync(int id, string nuevoEstado);
    Task<bool> ExisteCodigoAsync(string codigo, int? idExcluir = null);
    Task<bool> RegistrarAjusteInventarioAsync(MovimientoInventario movimiento, decimal deltaMetros);
}
