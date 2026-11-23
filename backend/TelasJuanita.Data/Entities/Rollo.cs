using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("rollo", Schema = "telas")]
public class Rollo
{
    [Key]
    [Column("id_rollo")]
    public int IdRollo { get; set; }

    [Column("id_tela")]
    public int IdTela { get; set; }
    public Tela Tela { get; set; } = null!;

    [Column("id_detalle_compra")]
    public int? IdDetalleCompra { get; set; }
    public DetalleCompra? DetalleCompra { get; set; }

    [Column("metros_iniciales")]
    public decimal MetrosIniciales { get; set; }

    [Column("metros_disponibles")]
    public decimal MetrosDisponibles { get; set; }

    [Column("fecha_ingreso")]
    public DateOnly FechaIngreso { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
}
