using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("devolucion", Schema = "telas")]
public class Devolucion
{
    [Key]
    [Column("id_devolucion")]
    public int IdDevolucion { get; set; }

    [Column("id_detalle_venta")]
    public int IdDetalleVenta { get; set; }
    public DetalleVenta DetalleVenta { get; set; } = null!;

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("cantidad_metros")]
    public decimal CantidadMetros { get; set; }

    [Column("monto")]
    public decimal Monto { get; set; }

    [Column("motivo")]
    [MaxLength(200)]
    public string Motivo { get; set; } = string.Empty;

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;
}
