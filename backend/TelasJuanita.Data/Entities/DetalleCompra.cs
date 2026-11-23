using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("detalle_compra", Schema = "telas")]
public class DetalleCompra
{
    [Key]
    [Column("id_detalle_compra")]
    public int IdDetalleCompra { get; set; }

    [Column("id_compra")]
    public int IdCompra { get; set; }
    public Compra Compra { get; set; } = null!;

    [Column("cantidad_metros")]
    public decimal CantidadMetros { get; set; }

    [Column("costo_unitario")]
    public decimal CostoUnitario { get; set; }
}
