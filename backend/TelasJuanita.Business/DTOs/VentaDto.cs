using System.ComponentModel.DataAnnotations;

namespace TelasJuanita.Business.DTOs;

public class CrearLineaVentaDto
{
    [Required]
    public int IdTela { get; set; }

    public int? IdRollo { get; set; }

    [Required]
    [Range(0.1, 10000, ErrorMessage = "La cantidad de metros debe ser mayor a 0")]
    public decimal CantidadMetros { get; set; }
}

public class RegistrarVentaDto
{
    public int? IdCliente { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Debe incluir al menos un corte de tela")]
    public List<CrearLineaVentaDto> Lineas { get; set; } = new();

    [Required]
    public string MetodoPago { get; set; } = "EFECTIVO"; // EFECTIVO, QR, TRANSFERENCIA, CREDITO

    public int? PlazoDiasCredito { get; set; } = 30;
}

public class DetalleNotaVentaDto
{
    public int IdDetalleVenta { get; set; }
    public int IdTela { get; set; }
    public string CodigoTela { get; set; } = string.Empty;
    public string NombreTela { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal CantidadMetros { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class NotaVentaDto
{
    public int IdVenta { get; set; }
    public string NumeroNota { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public int? IdCliente { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string Carnet { get; set; } = string.Empty;
    public string Vendedor { get; set; } = string.Empty;
    public decimal MetrosTotales { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal Total { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public bool EsCredito { get; set; }
    public decimal SaldoPendiente { get; set; }
    public DateOnly? FechaVencimiento { get; set; }
    public string Estado { get; set; } = "REGISTRADA"; // REGISTRADA, ANULADA
    public string? MotivoAnulacion { get; set; }
    public List<DetalleNotaVentaDto> Detalles { get; set; } = new();
}

public class AnularVentaDto
{
    [Required]
    public int IdVenta { get; set; }

    [Required(ErrorMessage = "El motivo de anulación es obligatorio (RN-04)")]
    [MinLength(5, ErrorMessage = "El motivo debe tener al menos 5 caracteres")]
    public string Motivo { get; set; } = string.Empty;
}

public class RegistrarDevolucionDto
{
    [Required]
    public int IdDetalleVenta { get; set; }

    [Required]
    [Range(0.1, 10000, ErrorMessage = "La cantidad a devolver debe ser mayor a 0")]
    public decimal CantidadMetros { get; set; }

    [Required(ErrorMessage = "El motivo de la devolución es obligatorio")]
    public string Motivo { get; set; } = string.Empty;
}
