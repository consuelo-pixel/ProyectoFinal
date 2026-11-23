using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("detalle_pedido", Schema = "telas")]
public class DetallePedido
{
    [Key]
    [Column("id_detalle_pedido")]
    public int IdDetallePedido { get; set; }

    [Column("id_pedido")]
    public int IdPedido { get; set; }
    public Pedido Pedido { get; set; } = null!;

    [Column("id_tela")]
    public int IdTela { get; set; }
    public Tela Tela { get; set; } = null!;

    [Column("cantidad_metros")]
    public decimal CantidadMetros { get; set; }

    [Column("subtotal")]
    public decimal Subtotal { get; set; }
}
