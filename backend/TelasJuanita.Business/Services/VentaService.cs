using TelasJuanita.Business.DTOs;
using TelasJuanita.Data;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class VentaService : IVentaService
{
    // RN-09: descuento por mayor
    private const decimal MetrosParaDescuento = 20m;
    private const decimal PorcentajeDescuento = 0.10m;

    private static readonly string[] MetodosPagoValidos = { "EFECTIVO", "QR", "TRANSFERENCIA", "CREDITO" };

    private readonly IVentaRepository _ventaRepo;
    private readonly ITelaRepository _telaRepo;
    private readonly IClienteRepository _clienteRepo;

    public VentaService(
        IVentaRepository ventaRepo,
        ITelaRepository telaRepo,
        IClienteRepository clienteRepo)
    {
        _ventaRepo = ventaRepo;
        _telaRepo = telaRepo;
        _clienteRepo = clienteRepo;
    }

    public async Task<(bool Exito, string? Error, NotaVentaDto? Nota)> RegistrarVentaAsync(RegistrarVentaDto dto, Guid idUsuario, string nombreUsuario)
    {
        if (dto.Lineas == null || dto.Lineas.Count == 0)
        {
            return (false, "Debe incluir al menos un corte de tela en la venta.", null);
        }

        var metodoPago = dto.MetodoPago.Trim().ToUpper();
        if (!MetodosPagoValidos.Contains(metodoPago))
        {
            return (false, "Método de pago no válido. Use EFECTIVO, QR, TRANSFERENCIA o CREDITO.", null);
        }

        var esCredito = metodoPago == "CREDITO";

        if (esCredito && !dto.IdCliente.HasValue)
        {
            return (false, "Para ventas a crédito (fiado) es obligatorio seleccionar un cliente registrado (RF-10).", null);
        }

        var plazo = dto.PlazoDiasCredito.GetValueOrDefault(30);
        if (esCredito && plazo <= 0)
        {
            return (false, "El plazo del crédito debe ser de al menos 1 día.", null);
        }

        // El cliente (si hay) tiene que existir y estar activo
        Cliente? cliente = null;
        if (dto.IdCliente.HasValue)
        {
            cliente = await _clienteRepo.ObtenerPorIdAsync(dto.IdCliente.Value);
            if (cliente == null)
            {
                return (false, "El cliente seleccionado no existe.", null);
            }
            if (cliente.Estado != "ACTIVO")
            {
                return (false, $"El cliente '{cliente.Nombre}' no está activo.", null);
            }
        }

        decimal subtotalGeneral = 0m;
        decimal totalMetros = 0m;
        var detallesEntidad = new List<DetalleVenta>();
        var detallesDto = new List<DetalleNotaVentaDto>();

        foreach (var linea in dto.Lineas)
        {
            var tela = await _telaRepo.ObtenerPorIdAsync(linea.IdTela);
            if (tela == null)
            {
                return (false, $"No se encontró la tela con ID {linea.IdTela}", null);
            }

            if (tela.Estado != "ACTIVA")
            {
                return (false, $"La tela '{tela.Nombre}' no está activa para la venta.", null);
            }

            var subtotalLinea = Math.Round(tela.PrecioMetro * linea.CantidadMetros, 2);
            subtotalGeneral += subtotalLinea;
            totalMetros += linea.CantidadMetros;

            detallesEntidad.Add(new DetalleVenta
            {
                IdTela = tela.IdTela,
                IdRollo = linea.IdRollo,
                CantidadMetros = linea.CantidadMetros,
                PrecioUnitario = tela.PrecioMetro,
                Subtotal = subtotalLinea
            });

            detallesDto.Add(new DetalleNotaVentaDto
            {
                IdTela = tela.IdTela,
                CodigoTela = tela.Codigo,
                NombreTela = tela.Nombre,
                Color = tela.Color ?? "",
                CantidadMetros = linea.CantidadMetros,
                PrecioUnitario = tela.PrecioMetro,
                Subtotal = subtotalLinea
            });
        }

        // RN-09: 10% de descuento si se compran 20 o más metros en total
        decimal descuento = totalMetros >= MetrosParaDescuento ? Math.Round(subtotalGeneral * PorcentajeDescuento, 2) : 0m;
        decimal totalFinal = Math.Round(subtotalGeneral - descuento, 2);

        // El crédito no puede pasar el límite del cliente
        if (esCredito && cliente != null)
        {
            var deudaActual = await _ventaRepo.ObtenerDeudaClienteAsync(cliente.IdCliente);
            if (deudaActual + totalFinal > cliente.LimiteCredito)
            {
                return (false, $"El crédito supera el límite del cliente (límite Bs. {cliente.LimiteCredito:F2}, deuda actual Bs. {deudaActual:F2}).", null);
            }
        }

        var fechaVencimiento = esCredito ? HoraBolivia.Hoy().AddDays(plazo) : (DateOnly?)null;

        var venta = new Venta
        {
            Fecha = DateTime.UtcNow,
            IdCliente = dto.IdCliente,
            IdUsuario = idUsuario,
            Total = totalFinal,
            Descuento = descuento,
            Estado = "REGISTRADA",
            EsCredito = esCredito,
            SaldoPendiente = esCredito ? totalFinal : 0m,
            FechaVencimiento = fechaVencimiento
        };

        Pago? pagoInicial = null;
        if (!esCredito)
        {
            pagoInicial = new Pago
            {
                Fecha = DateTime.UtcNow,
                Monto = totalFinal,
                MetodoPago = metodoPago,
                IdUsuario = idUsuario
            };
        }

        Venta ventaGuardada;
        try
        {
            ventaGuardada = await _ventaRepo.RegistrarVentaAsync(venta, detallesEntidad, pagoInicial);
        }
        catch (InvalidOperationException ex)
        {
            // Errores de negocio (por ejemplo, falta de stock): se le muestran a la vendedora
            return (false, ex.Message, null);
        }

        var nota = new NotaVentaDto
        {
            IdVenta = ventaGuardada.IdVenta,
            NumeroNota = $"NV-{ventaGuardada.IdVenta:D6}",
            Fecha = ventaGuardada.Fecha,
            IdCliente = cliente?.IdCliente,
            Cliente = cliente?.Nombre ?? "Venta de Mostrador",
            Carnet = cliente?.Carnet ?? "S/N",
            Vendedor = nombreUsuario,
            MetrosTotales = totalMetros,
            Subtotal = subtotalGeneral,
            Descuento = descuento,
            Total = totalFinal,
            MetodoPago = metodoPago,
            EsCredito = esCredito,
            SaldoPendiente = ventaGuardada.SaldoPendiente,
            FechaVencimiento = ventaGuardada.FechaVencimiento,
            Estado = "REGISTRADA",
            Detalles = detallesDto
        };

        return (true, null, nota);
    }

    public async Task<List<NotaVentaDto>> ListarVentasRecientesAsync(int limite = 50)
    {
        // Para que nadie pida miles de ventas de golpe
        if (limite < 1) limite = 1;
        if (limite > 200) limite = 200;

        var ventas = await _ventaRepo.ListarVentasRecientesAsync(limite);
        return ventas.Select(ConvertirANota).ToList();
    }

    public async Task<NotaVentaDto?> ObtenerNotaVentaAsync(int idVenta)
    {
        var venta = await _ventaRepo.ObtenerVentaConDetallesAsync(idVenta);
        if (venta == null) return null;

        return ConvertirANota(venta);
    }

    public async Task<(bool Exito, string? Error)> AnularVentaAsync(AnularVentaDto dto, Guid idUsuario, string rolUsuario)
    {
        // RN-04: Solo la Dueña puede anular ventas
        if (rolUsuario != "Dueña")
        {
            return (false, "Permiso denegado: Únicamente la Dueña / Administradora tiene autorización para anular notas de venta (RN-04).");
        }

        if (string.IsNullOrWhiteSpace(dto.Motivo))
        {
            return (false, "El motivo de la anulación es estrictamente obligatorio.");
        }

        try
        {
            var anulada = await _ventaRepo.AnularVentaAsync(dto.IdVenta, dto.Motivo.Trim(), idUsuario);
            if (!anulada)
            {
                return (false, "No se pudo anular la venta. Verifique que la venta exista y no esté ya anulada.");
            }
            return (true, null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<(bool Exito, string? Error)> RegistrarDevolucionAsync(RegistrarDevolucionDto dto, Guid idUsuario)
    {
        if (dto.CantidadMetros <= 0)
        {
            return (false, "La cantidad a devolver debe ser mayor a 0 metros.");
        }

        if (string.IsNullOrWhiteSpace(dto.Motivo))
        {
            return (false, "El motivo de devolución es obligatorio.");
        }

        var devolucion = new Devolucion
        {
            IdDetalleVenta = dto.IdDetalleVenta,
            Fecha = DateTime.UtcNow,
            CantidadMetros = dto.CantidadMetros,
            Motivo = dto.Motivo.Trim(),
            IdUsuario = idUsuario
        };

        try
        {
            await _ventaRepo.RegistrarDevolucionAsync(devolucion);
            return (true, null);
        }
        catch (InvalidOperationException ex)
        {
            return (false, ex.Message);
        }
    }

    // Arma la nota de venta a partir de la venta guardada en la base
    private static NotaVentaDto ConvertirANota(Venta v)
    {
        return new NotaVentaDto
        {
            IdVenta = v.IdVenta,
            NumeroNota = $"NV-{v.IdVenta:D6}",
            Fecha = v.Fecha,
            IdCliente = v.IdCliente,
            Cliente = v.Cliente?.Nombre ?? "Venta Mostrador",
            Carnet = v.Cliente?.Carnet ?? "—",
            Vendedor = v.Usuario?.Nombre ?? "Vendedora",
            MetrosTotales = v.Detalles.Sum(d => d.CantidadMetros),
            Subtotal = v.Total + v.Descuento,
            Descuento = v.Descuento,
            Total = v.Total,
            MetodoPago = v.EsCredito ? "CREDITO" : (v.Pagos.FirstOrDefault()?.MetodoPago ?? "EFECTIVO"),
            EsCredito = v.EsCredito,
            SaldoPendiente = v.SaldoPendiente,
            FechaVencimiento = v.FechaVencimiento,
            Estado = v.Estado,
            MotivoAnulacion = v.MotivoAnulacion,
            Detalles = v.Detalles.Select(d => new DetalleNotaVentaDto
            {
                IdDetalleVenta = d.IdDetalleVenta,
                IdTela = d.IdTela,
                CodigoTela = d.Tela?.Codigo ?? "",
                NombreTela = d.Tela?.Nombre ?? "Tela",
                Color = d.Tela?.Color ?? "",
                CantidadMetros = d.CantidadMetros,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal
            }).ToList()
        };
    }
}
