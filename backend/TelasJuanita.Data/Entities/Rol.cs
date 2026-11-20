using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("rol", Schema = "telas")]
public class Rol
{
    [Key]
    [Column("id_rol")]
    public short IdRol { get; set; }

    [Column("nombre")]
    [MaxLength(30)]
    public string Nombre { get; set; } = string.Empty;

    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<RolPermiso> RolPermisos { get; set; } = new List<RolPermiso>();
}
