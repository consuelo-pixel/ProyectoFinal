using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("abono", Schema = "telas")]
public class Abono
{
    [Key]
    [Column("id_abono")]
    public int IdAbono { get; set; }

    [Column("id_venta")]
    public int IdVenta { get; set; }
    public Venta Venta { get; set; } = null!;

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("monto")]
    public decimal Monto { get; set; }

    [Column("metodo_pago")]
    [MaxLength(20)]
    public string MetodoPago { get; set; } = "EFECTIVO";

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;
}
