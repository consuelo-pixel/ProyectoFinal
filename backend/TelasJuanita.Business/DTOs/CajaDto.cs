using System.ComponentModel.DataAnnotations;

namespace TelasJuanita.Business.DTOs;

public class ResumenCajaHoyDto
{
    public DateOnly Fecha { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTransferencia { get; set; }
    public decimal TotalQr { get; set; }
    public decimal TotalGeneral { get; set; }
    public int CantidadVentas { get; set; }
    public bool YaCerrado { get; set; }
    public string? ObservacionCierre { get; set; }
}

public class RegistrarCierreCajaDto
{
    [Range(0, 1000000)]
    public decimal TotalEfectivo { get; set; }

    [Range(0, 1000000)]
    public decimal TotalTransferencia { get; set; }

    [Range(0, 1000000)]
    public decimal TotalQr { get; set; }

    [StringLength(200)]
    public string? Observacion { get; set; }
}

public class CierreCajaHistorialDto
{
    public int IdCierre { get; set; }
    public DateOnly Fecha { get; set; }
    public DateTime FechaHora { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTransferencia { get; set; }
    public decimal TotalQr { get; set; }
    public decimal TotalGeneral { get; set; }
    public string? Observacion { get; set; }
}
