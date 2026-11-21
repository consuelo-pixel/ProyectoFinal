using TelasJuanita.Business.DTOs;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class TelaService : ITelaService
{
    private readonly ITelaRepository _telaRepo;

    public TelaService(ITelaRepository telaRepo)
    {
        _telaRepo = telaRepo;
    }

    public async Task<List<TelaDto>> ListarTelasAsync(string? estado = null, string? buscar = null)
    {
        var telas = await _telaRepo.ObtenerTodasAsync(estado, buscar);
        return telas.Select(t => new TelaDto
        {
            IdTela = t.IdTela,
            Codigo = t.Codigo,
            Nombre = t.Nombre,
            Tipo = t.Tipo,
            Color = t.Color,
            Ancho = t.Ancho,
            PrecioMetro = t.PrecioMetro,
            StockMinimo = t.StockMinimo,
            UrlFoto = t.UrlFoto,
            Estado = t.Estado,
            MetrosDisponibles = t.Rollos?.Sum(r => r.MetrosDisponibles) ?? 0m
        }).ToList();
    }

    public async Task<TelaDto?> ObtenerPorIdAsync(int id)
    {
        var t = await _telaRepo.ObtenerPorIdAsync(id);
        if (t == null) return null;

        return new TelaDto
        {
            IdTela = t.IdTela,
            Codigo = t.Codigo,
            Nombre = t.Nombre,
            Tipo = t.Tipo,
            Color = t.Color,
            Ancho = t.Ancho,
            PrecioMetro = t.PrecioMetro,
            StockMinimo = t.StockMinimo,
            UrlFoto = t.UrlFoto,
            Estado = t.Estado,
            MetrosDisponibles = t.Rollos?.Sum(r => r.MetrosDisponibles) ?? 0m
        };
    }

    public async Task<(bool Exito, string? Error, TelaDto? Tela)> RegistrarTelaAsync(CrearTelaDto dto)
    {
        if (await _telaRepo.ExisteCodigoAsync(dto.Codigo))
        {
            return (false, $"Ya existe una tela con el código '{dto.Codigo}'", null);
        }

        var entidad = new Tela
        {
            Codigo = dto.Codigo.Trim().ToUpper(),
            Nombre = dto.Nombre.Trim(),
            Tipo = string.IsNullOrWhiteSpace(dto.Tipo) ? null : dto.Tipo.Trim(),
            Color = string.IsNullOrWhiteSpace(dto.Color) ? null : dto.Color.Trim(),
            Ancho = dto.Ancho,
            PrecioMetro = dto.PrecioMetro,
            StockMinimo = dto.StockMinimo,
            UrlFoto = string.IsNullOrWhiteSpace(dto.UrlFoto) ? null : dto.UrlFoto.Trim(),
            Estado = "ACTIVA"
        };

        var creada = await _telaRepo.CrearAsync(entidad);

        var telaDto = new TelaDto
        {
            IdTela = creada.IdTela,
            Codigo = creada.Codigo,
            Nombre = creada.Nombre,
            Tipo = creada.Tipo,
            Color = creada.Color,
            Ancho = creada.Ancho,
            PrecioMetro = creada.PrecioMetro,
            StockMinimo = creada.StockMinimo,
            UrlFoto = creada.UrlFoto,
            Estado = creada.Estado,
            MetrosDisponibles = 0m
        };

        return (true, null, telaDto);
    }

    public async Task<(bool Exito, string? Error)> CambiarEstadoAsync(int id, string nuevoEstado)
    {
        var estadoNormalizado = nuevoEstado.Trim().ToUpper();
        if (estadoNormalizado != "ACTIVA" && estadoNormalizado != "DESHABILITADA")
        {
            return (false, "El estado solo puede ser 'ACTIVA' o 'DESHABILITADA'");
        }

        var ok = await _telaRepo.CambiarEstadoAsync(id, estadoNormalizado);
        if (!ok) return (false, "Tela no encontrada");

        return (true, null);
    }
}
