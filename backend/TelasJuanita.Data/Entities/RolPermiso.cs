using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("rol_permiso", Schema = "telas")]
public class RolPermiso
{
    [Column("id_rol")]
    public short IdRol { get; set; }
    public Rol Rol { get; set; } = null!;

    [Column("id_permiso")]
    public short IdPermiso { get; set; }
    public Permiso Permiso { get; set; } = null!;
}
