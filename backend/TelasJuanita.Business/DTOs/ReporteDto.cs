namespace TelasJuanita.Business.DTOs;

public class ResumenVentasPeriodoDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public decimal TotalVentasMonto { get; set; }
    public int CantidadNotasEmitidas { get; set; }
    public decimal TotalEfectivo { get; set; }
    public decimal TotalQr { get; set; }
    public decimal TotalTransferencia { get; set; }
    public decimal TotalCreditoEmitido { get; set; }
    public decimal TotalMetrosVendidos { get; set; }
    public decimal TicketPromedio { get; set; }
}

public class RotacionTelaDto
{
    public int IdTela { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal MetrosVendidos { get; set; }
    public decimal MontoGenerado { get; set; }
    public decimal MetrosDisponibles { get; set; }
    public string NivelRotacion { get; set; } = "MEDIA"; // ALTA, MEDIA, ESTANCADA
    public string SugerenciaComercial { get; set; } = string.Empty;
}

public class ReporteGeneralDto
{
    public ResumenVentasPeriodoDto VentasPeriodo { get; set; } = new();
    public List<RotacionTelaDto> RotacionTelas { get; set; } = new();
}
