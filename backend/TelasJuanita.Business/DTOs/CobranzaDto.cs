using System.ComponentModel.DataAnnotations;

namespace TelasJuanita.Business.DTOs;

public class CuentaPorCobrarDto
{
    public int IdVenta { get; set; }
    public int IdCliente { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string CarnetCliente { get; set; } = string.Empty;
    public string? TelefonoCliente { get; set; }
    public DateTime FechaVenta { get; set; }
    public decimal TotalVenta { get; set; }
    public decimal SaldoPendiente { get; set; }
    public DateOnly? FechaVencimiento { get; set; }
}

public class RegistrarAbonoDto
{
    [Required]
    public int IdVenta { get; set; }

    [Required]
    [Range(0.5, 100000, ErrorMessage = "El abono debe ser mayor a 0")]
    public decimal Monto { get; set; }

    [Required]
    public string MetodoPago { get; set; } = "EFECTIVO"; // EFECTIVO, QR, TRANSFERENCIA
}

public class ComprobanteAbonoDto
{
    public int IdAbono { get; set; }
    public string NroComprobante { get; set; } = string.Empty;
    public int IdVenta { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string Carnet { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public decimal MontoAbonado { get; set; }
    public decimal SaldoAnterior { get; set; }
    public decimal SaldoRestante { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public string CobradoPor { get; set; } = string.Empty;
}
