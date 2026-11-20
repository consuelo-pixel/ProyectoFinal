using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("permiso", Schema = "telas")]
public class Permiso
{
    [Key]
    [Column("id_permiso")]
    public short IdPermiso { get; set; }

    [Column("codigo")]
    [MaxLength(40)]
    public string Codigo { get; set; } = string.Empty;

    [Column("descripcion")]
    [MaxLength(120)]
    public string Descripcion { get; set; } = string.Empty;

    public ICollection<RolPermiso> RolPermisos { get; set; } = new List<RolPermiso>();
}
