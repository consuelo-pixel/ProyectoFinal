using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("pedido", Schema = "telas")]
public class Pedido
{
    [Key]
    [Column("id_pedido")]
    public int IdPedido { get; set; }

    [Column("id_cliente")]
    public int IdCliente { get; set; }
    public Cliente Cliente { get; set; } = null!;

    [Column("id_usuario")]
    public Guid? IdUsuario { get; set; }
    public Usuario? Usuario { get; set; }

    [Column("origen")]
    [MaxLength(10)]
    public string Origen { get; set; } = "MOSTRADOR";

    [Column("tipo")]
    [MaxLength(10)]
    public string Tipo { get; set; } = "PEDIDO";

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("fecha_vencimiento")]
    public DateOnly? FechaVencimiento { get; set; }

    [Column("estado")]
    [MaxLength(15)]
    public string Estado { get; set; } = "PENDIENTE";

    public ICollection<DetallePedido> Detalles { get; set; } = new List<DetallePedido>();
}
