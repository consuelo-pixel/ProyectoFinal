using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("pago", Schema = "telas")]
public class Pago
{
    [Key]
    [Column("id_pago")]
    public int IdPago { get; set; }

    [Column("id_venta")]
    public int IdVenta { get; set; }
    public Venta Venta { get; set; } = null!;

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("monto")]
    public decimal Monto { get; set; }

    [Column("metodo_pago")]
    [MaxLength(20)]
    public string MetodoPago { get; set; } = string.Empty;

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;
}
