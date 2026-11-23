using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("compra", Schema = "telas")]
public class Compra
{
    [Key]
    [Column("id_compra")]
    public int IdCompra { get; set; }

    [Column("fecha")]
    public DateOnly Fecha { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    [Column("total")]
    public decimal Total { get; set; }

    [Column("id_proveedor")]
    public int IdProveedor { get; set; }
    public Proveedor Proveedor { get; set; } = null!;

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public ICollection<DetalleCompra> Detalles { get; set; } = new List<DetalleCompra>();
}
