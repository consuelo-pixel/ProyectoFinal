using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("descuento_mayor", Schema = "telas")]
public class DescuentoMayor
{
    [Key]
    [Column("id_descuento")]
    public int IdDescuento { get; set; }

    [Column("metros_minimos")]
    public decimal MetrosMinimos { get; set; }

    [Column("porcentaje")]
    public decimal Porcentaje { get; set; }

    [Column("estado")]
    [MaxLength(10)]
    public string Estado { get; set; } = "ACTIVO";
}
