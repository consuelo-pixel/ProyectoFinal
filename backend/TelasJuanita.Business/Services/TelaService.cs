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

    public async Task<(bool Exito, string? Error)> AjustarInventarioAsync(AjustarInventarioDto dto, Guid idUsuario)
    {
        // RF-06: Motivo obligatorio para ajustes de inventario
        if (string.IsNullOrWhiteSpace(dto.Motivo))
        {
            return (false, "El motivo del ajuste de inventario es estrictamente obligatorio (RF-06).");
        }

        if (dto.CantidadMetros <= 0)
        {
            return (false, "La cantidad de metros debe ser mayor a 0.");
        }

        var tipoOperacion = dto.TipoOperacion.Trim().ToUpper();
        if (tipoOperacion != "INCREMENTO" && tipoOperacion != "DISMINUCION")
        {
            return (false, "El tipo de operación debe ser INCREMENTO o DISMINUCION.");
        }

        var tela = await _telaRepo.ObtenerPorIdAsync(dto.IdTela);
        if (tela == null)
        {
            return (false, "No se encontró la tela especificada.");
        }

        var deltaMetros = tipoOperacion == "INCREMENTO" ? dto.CantidadMetros : -dto.CantidadMetros;

        var movimiento = new MovimientoInventario
        {
            Fecha = DateTime.UtcNow,
            Tipo = "AJUSTE",
            CantidadMetros = dto.CantidadMetros,
            Motivo = dto.Motivo.Trim(),
            IdTela = dto.IdTela,
            IdRollo = dto.IdRollo,
            IdUsuario = idUsuario
        };

        try
        {
            await _telaRepo.RegistrarAjusteInventarioAsync(movimiento, deltaMetros);
            return (true, null);
        }
        catch (InvalidOperationException ex)
        {
            // Errores de negocio (por ejemplo, dejar el rollo en negativo)
            return (false, ex.Message);
        }
    }
}
