using TelasJuanita.Business.DTOs;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class CobranzaService : ICobranzaService
{
    private static readonly string[] MetodosPagoValidos = { "EFECTIVO", "QR", "TRANSFERENCIA" };

    private readonly ICobranzaRepository _cobranzaRepo;

    public CobranzaService(ICobranzaRepository cobranzaRepo)
    {
        _cobranzaRepo = cobranzaRepo;
    }

    public async Task<List<CuentaPorCobrarDto>> ObtenerCuentasPendientesAsync(string? buscar = null)
    {
        var ventas = await _cobranzaRepo.ObtenerCuentasPendientesAsync(buscar);
        return ventas.Select(v => new CuentaPorCobrarDto
        {
            IdVenta = v.IdVenta,
            IdCliente = v.IdCliente ?? 0,
            NombreCliente = v.Cliente?.Nombre ?? "Cliente sin nombre",
            CarnetCliente = v.Cliente?.Carnet ?? "S/N",
            TelefonoCliente = v.Cliente?.Telefono,
            FechaVenta = v.Fecha,
            TotalVenta = v.Total,
            SaldoPendiente = v.SaldoPendiente,
            FechaVencimiento = v.FechaVencimiento
        }).ToList();
    }

    public async Task<(bool Exito, string? Error, ComprobanteAbonoDto? Comprobante)> RegistrarAbonoAsync(RegistrarAbonoDto dto, Guid idUsuario, string nombreUsuario)
    {
        if (dto.Monto <= 0)
        {
            return (false, "El monto del abono debe ser mayor a 0 Bs.", null);
        }

        var metodoPago = dto.MetodoPago.Trim().ToUpper();
        if (!MetodosPagoValidos.Contains(metodoPago))
        {
            return (false, "Método de pago no válido. Use EFECTIVO, QR o TRANSFERENCIA.", null);
        }

        var venta = await _cobranzaRepo.ObtenerVentaConClienteAsync(dto.IdVenta);
        if (venta == null)
        {
            return (false, $"No se encontró la venta #{dto.IdVenta}", null);
        }

        if (!venta.EsCredito)
        {
            return (false, "Esta venta no fue registrada a crédito.", null);
        }

        if (venta.Estado == "ANULADA")
        {
            return (false, "La venta está anulada, no se pueden registrar abonos.", null);
        }

        if (dto.Monto > venta.SaldoPendiente)
        {
            return (false, $"El abono (Bs. {dto.Monto:F2}) excede el saldo pendiente actual de Bs. {venta.SaldoPendiente:F2}", null);
        }

        var saldoAnterior = venta.SaldoPendiente;
        var nuevoSaldo = saldoAnterior - dto.Monto;

        var abono = new Abono
        {
            IdVenta = venta.IdVenta,
            Fecha = DateTime.UtcNow,
            Monto = dto.Monto,
            MetodoPago = metodoPago,
            IdUsuario = idUsuario
        };

        // El saldo de la venta lo descuenta la base de datos sola (trigger), no hace falta actualizarlo acá
        var abonoCreado = await _cobranzaRepo.RegistrarAbonoAsync(abono);

        var comprobante = new ComprobanteAbonoDto
        {
            IdAbono = abonoCreado.IdAbono,
            NroComprobante = $"AB-{abonoCreado.IdAbono:D6}",
            IdVenta = venta.IdVenta,
            Cliente = venta.Cliente?.Nombre ?? "Cliente sin registrar",
            Carnet = venta.Cliente?.Carnet ?? "S/N",
            Fecha = abonoCreado.Fecha,
            MontoAbonado = dto.Monto,
            SaldoAnterior = saldoAnterior,
            SaldoRestante = nuevoSaldo,
            MetodoPago = metodoPago,
            CobradoPor = nombreUsuario
        };

        return (true, null, comprobante);
    }

    public async Task<List<ComprobanteAbonoDto>> ObtenerHistorialAbonosAsync(int idVenta)
    {
        var abonos = await _cobranzaRepo.ObtenerHistorialAbonosVentaAsync(idVenta);
        return abonos.Select(a => new ComprobanteAbonoDto
        {
            IdAbono = a.IdAbono,
            NroComprobante = $"AB-{a.IdAbono:D6}",
            IdVenta = a.IdVenta,
            Cliente = a.Venta?.Cliente?.Nombre ?? "Cliente",
            Carnet = a.Venta?.Cliente?.Carnet ?? "S/N",
            Fecha = a.Fecha,
            MontoAbonado = a.Monto,
            SaldoAnterior = 0,
            SaldoRestante = 0,
            MetodoPago = a.MetodoPago,
            CobradoPor = a.Usuario?.Nombre ?? "Usuario"
        }).ToList();
    }
}
