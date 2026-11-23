using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("venta", Schema = "telas")]
public class Venta
{
    [Key]
    [Column("id_venta")]
    public int IdVenta { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("id_cliente")]
    public int? IdCliente { get; set; }
    public Cliente? Cliente { get; set; }

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [Column("id_pedido")]
    public int? IdPedido { get; set; }
    public Pedido? Pedido { get; set; }

    [Column("total")]
    public decimal Total { get; set; }

    [Column("descuento")]
    public decimal Descuento { get; set; } = 0m;

    [Column("estado")]
    [MaxLength(10)]
    public string Estado { get; set; } = "REGISTRADA";

    [Column("es_credito")]
    public bool EsCredito { get; set; } = false;

    [Column("saldo_pendiente")]
    public decimal SaldoPendiente { get; set; } = 0m;

    [Column("fecha_vencimiento")]
    public DateOnly? FechaVencimiento { get; set; }

    [Column("motivo_anulacion")]
    [MaxLength(200)]
    public string? MotivoAnulacion { get; set; }

    [Column("fecha_anulacion")]
    public DateTime? FechaAnulacion { get; set; }

    [Column("id_usuario_anulacion")]
    public Guid? IdUsuarioAnulacion { get; set; }
    public Usuario? UsuarioAnulacion { get; set; }

    public ICollection<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
    public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    public ICollection<Abono> Abonos { get; set; } = new List<Abono>();
}
