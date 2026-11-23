using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("tela", Schema = "telas")]
public class Tela
{
    [Key]
    [Column("id_tela")]
    public int IdTela { get; set; }

    [Column("codigo")]
    [MaxLength(30)]
    public string Codigo { get; set; } = string.Empty;

    [Column("nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("tipo")]
    [MaxLength(50)]
    public string? Tipo { get; set; }

    [Column("color")]
    [MaxLength(40)]
    public string? Color { get; set; }

    [Column("ancho")]
    public decimal? Ancho { get; set; }

    [Column("precio_metro")]
    public decimal PrecioMetro { get; set; }

    [Column("stock_minimo")]
    public decimal StockMinimo { get; set; } = 0m;

    [Column("url_foto")]
    [MaxLength(300)]
    public string? UrlFoto { get; set; }

    [Column("estado")]
    [MaxLength(12)]
    public string Estado { get; set; } = "ACTIVA";

    public ICollection<Rollo> Rollos { get; set; } = new List<Rollo>();
    public ICollection<HistorialPrecio> HistorialPrecios { get; set; } = new List<HistorialPrecio>();
}
