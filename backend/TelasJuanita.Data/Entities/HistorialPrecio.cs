using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("historial_precio", Schema = "telas")]
public class HistorialPrecio
{
    [Key]
    [Column("id_historial")]
    public int IdHistorial { get; set; }

    [Column("id_tela")]
    public int IdTela { get; set; }
    public Tela Tela { get; set; } = null!;

    [Column("precio_anterior")]
    public decimal PrecioAnterior { get; set; }

    [Column("precio_nuevo")]
    public decimal PrecioNuevo { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column("id_usuario")]
    public Guid? IdUsuario { get; set; }
    public Usuario? Usuario { get; set; }
}
