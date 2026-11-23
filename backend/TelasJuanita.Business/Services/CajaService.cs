using TelasJuanita.Business.DTOs;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class CajaService : ICajaService
{
    private readonly ICajaRepository _cajaRepo;

    public CajaService(ICajaRepository cajaRepo)
    {
        _cajaRepo = cajaRepo;
    }

    public async Task<ResumenCajaHoyDto> ObtenerResumenHoyAsync()
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var cierreExistente = await _cajaRepo.ObtenerCierreDelDiaAsync(hoy);

        if (cierreExistente != null)
        {
            return new ResumenCajaHoyDto
            {
                Fecha = hoy,
                TotalEfectivo = cierreExistente.TotalEfectivo,
                TotalTransferencia = cierreExistente.TotalTransferencia,
                TotalQr = cierreExistente.TotalQr,
                TotalGeneral = cierreExistente.TotalGeneral,
                YaCerrado = true,
                ObservacionCierre = cierreExistente.Observacion
            };
        }

        var (efectivo, qr, transferencias, total, cantidad) = await _cajaRepo.CalcularTotalesDiaAsync(hoy);

        return new ResumenCajaHoyDto
        {
            Fecha = hoy,
            TotalEfectivo = efectivo,
            TotalTransferencia = transferencias,
            TotalQr = qr,
            TotalGeneral = total,
            CantidadVentas = cantidad,
            YaCerrado = false
        };
    }

    public async Task<(bool Exito, string? Error, CierreCajaHistorialDto? Cierre)> RealizarCierreCajaAsync(RegistrarCierreCajaDto dto, Guid idUsuario)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var existente = await _cajaRepo.ObtenerCierreDelDiaAsync(hoy);
        if (existente != null)
        {
            return (false, "El cierre de caja para el día de hoy ya fue registrado anteriormente.", null);
        }

        var total = dto.TotalEfectivo + dto.TotalTransferencia + dto.TotalQr;

        var entidad = new CierreCaja
        {
            Fecha = hoy,
            FechaHora = DateTime.UtcNow,
            IdUsuario = idUsuario,
            TotalEfectivo = dto.TotalEfectivo,
            TotalTransferencia = dto.TotalTransferencia,
            TotalQr = dto.TotalQr,
            TotalGeneral = total,
            Observacion = string.IsNullOrWhiteSpace(dto.Observacion) ? "Cierre diario sin novedades" : dto.Observacion.Trim()
        };

        var creado = await _cajaRepo.RegistrarCierreAsync(entidad);

        return (true, null, new CierreCajaHistorialDto
        {
            IdCierre = creado.IdCierre,
            Fecha = creado.Fecha,
            FechaHora = creado.FechaHora,
            Usuario = "Usuario Actual",
            TotalEfectivo = creado.TotalEfectivo,
            TotalTransferencia = creado.TotalTransferencia,
            TotalQr = creado.TotalQr,
            TotalGeneral = creado.TotalGeneral,
            Observacion = creado.Observacion
        });
    }

    public async Task<List<CierreCajaHistorialDto>> ListarHistorialCierresAsync()
    {
        var lista = await _cajaRepo.ObtenerHistorialAsync();
        return lista.Select(c => new CierreCajaHistorialDto
        {
            IdCierre = c.IdCierre,
            Fecha = c.Fecha,
            FechaHora = c.FechaHora,
            Usuario = c.Usuario?.Nombre ?? "Administración",
            TotalEfectivo = c.TotalEfectivo,
            TotalTransferencia = c.TotalTransferencia,
            TotalQr = c.TotalQr,
            TotalGeneral = c.TotalGeneral,
            Observacion = c.Observacion
        }).ToList();
    }
}
