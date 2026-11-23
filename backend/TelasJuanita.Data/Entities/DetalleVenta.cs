using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("detalle_venta", Schema = "telas")]
public class DetalleVenta
{
    [Key]
    [Column("id_detalle_venta")]
    public int IdDetalleVenta { get; set; }

    [Column("id_venta")]
    public int IdVenta { get; set; }
    public Venta Venta { get; set; } = null!;

    [Column("id_tela")]
    public int IdTela { get; set; }
    public Tela Tela { get; set; } = null!;

    [Column("id_rollo")]
    public int? IdRollo { get; set; }
    public Rollo? Rollo { get; set; }

    [Column("cantidad_metros")]
    public decimal CantidadMetros { get; set; }

    [Column("precio_unitario")]
    public decimal PrecioUnitario { get; set; }

    [Column("subtotal")]
    public decimal Subtotal { get; set; }
}
