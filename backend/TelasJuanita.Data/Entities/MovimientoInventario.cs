using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("movimiento_inventario", Schema = "telas")]
public class MovimientoInventario
{
    [Key]
    [Column("id_movimiento")]
    public int IdMovimiento { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("tipo")]
    [MaxLength(15)]
    public string Tipo { get; set; } = string.Empty;

    [Column("cantidad_metros")]
    public decimal CantidadMetros { get; set; }

    [Column("motivo")]
    [MaxLength(200)]
    public string? Motivo { get; set; }

    [Column("id_tela")]
    public int IdTela { get; set; }
    public Tela Tela { get; set; } = null!;

    [Column("id_rollo")]
    public int? IdRollo { get; set; }
    public Rollo? Rollo { get; set; }

    [Column("id_usuario")]
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;
}
