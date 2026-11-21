
using System;
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
    public DateOnly FechaIngreso { get; set; }
        = DateOnly.FromDateTime(DateTime.UtcNow);

    // Metodo para descontar metros del inventario
    public void DescontarMetros(decimal metros)
    {
        if (metros <= 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(metros),
                "Los metros deben ser mayores a cero."
            );
        }

        if (metros > MetrosDisponibles)
        {
            throw new InvalidOperationException(
                "No hay suficientes metros disponibles."
            );
        }

        MetrosDisponibles -= metros;
    }
}
