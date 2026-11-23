using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("proveedor", Schema = "telas")]
public class Proveedor
{
    [Key]
    [Column("id_proveedor")]
    public int IdProveedor { get; set; }

    [Column("nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("telefono")]
    [MaxLength(20)]
    public string? Telefono { get; set; }

    [Column("nit")]
    [MaxLength(20)]
    public string Nit { get; set; } = string.Empty;

    public ICollection<Compra> Compras { get; set; } = new List<Compra>();
}
