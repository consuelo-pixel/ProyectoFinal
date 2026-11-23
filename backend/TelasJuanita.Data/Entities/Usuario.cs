using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("usuario", Schema = "telas")]
public class Usuario
{
    [Key]
    [Column("id_usuario")]
    public Guid IdUsuario { get; set; } = Guid.NewGuid();

    [Column("nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("correo")]
    [MaxLength(120)]
    public string Correo { get; set; } = string.Empty;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("id_rol")]
    public short IdRol { get; set; }
    public Rol Rol { get; set; } = null!;

    [Column("estado")]
    [MaxLength(10)]
    public string Estado { get; set; } = "ACTIVO";

    [Column("intentos_fallidos")]
    public int IntentosFallidos { get; set; } = 0;

    [Column("bloqueado_hasta")]
    public DateTime? BloqueadoHasta { get; set; }

    [Column("ultimo_acceso")]
    public DateTime? UltimoAcceso { get; set; }

    [Column("debe_cambiar_password")]
    public bool DebeCambiarPassword { get; set; } = true;
}
