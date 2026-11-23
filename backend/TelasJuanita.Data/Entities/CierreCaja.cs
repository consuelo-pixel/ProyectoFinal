using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("cierre_caja", Schema = "telas")]
public class CierreCaja
{
    [Key]
    [Column("id_cierre")]
    public int IdCierre { get; set; }

    [Column("fecha")]
    public DateOnly Fecha { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    [Column("fecha_hora")]
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [Column("total_efectivo")]
    public decimal TotalEfectivo { get; set; } = 0m;

    [Column("total_transferencia")]
    public decimal TotalTransferencia { get; set; } = 0m;

    [Column("total_qr")]
    public decimal TotalQr { get; set; } = 0m;

    [Column("total_general")]
    public decimal TotalGeneral { get; set; } = 0m;

    [Column("observacion")]
    [MaxLength(200)]
    public string? Observacion { get; set; }
}
