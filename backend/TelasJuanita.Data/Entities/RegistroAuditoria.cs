using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("registro_auditoria", Schema = "telas")]
public class RegistroAuditoria
{
    [Key]
    [Column("id_registro")]
    public long IdRegistro { get; set; }

    [Column("fecha_hora")]
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    [Column("id_usuario")]
    public Guid? IdUsuario { get; set; }

    [Column("accion")]
    [MaxLength(30)]
    public string Accion { get; set; } = string.Empty;

    [Column("entidad")]
    [MaxLength(40)]
    public string Entidad { get; set; } = string.Empty;

    [Column("id_entidad")]
    public string? IdEntidad { get; set; }

    [Column("valor_anterior", TypeName = "jsonb")]
    public string? ValorAnterior { get; set; }

    [Column("valor_nuevo", TypeName = "jsonb")]
    public string? ValorNuevo { get; set; }

    [Column("resultado")]
    [MaxLength(10)]
    public string Resultado { get; set; } = "OK";

    [Column("ip")]
    public string? Ip { get; set; }
}
