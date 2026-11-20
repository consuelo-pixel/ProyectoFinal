using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TelasJuanita.Data.Entities;

[Table("cliente", Schema = "telas")]
public class Cliente
{
    [Key]
    [Column("id_cliente")]
    public int IdCliente { get; set; }

    [Column("nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("carnet")]
    [MaxLength(20)]
    public string Carnet { get; set; } = string.Empty;

    [Column("nit")]
    [MaxLength(20)]
    public string? Nit { get; set; }

    [Column("telefono")]
    [MaxLength(20)]
    public string? Telefono { get; set; }

    [Column("direccion")]
    [MaxLength(200)]
    public string? Direccion { get; set; }

    [Column("limite_credito")]
    public decimal LimiteCredito { get; set; } = 0m;

    [Column("codigo_consulta_hash")]
    public string? CodigoConsultaHash { get; set; }

    [Column("estado")]
    [MaxLength(10)]
    public string Estado { get; set; } = "ACTIVO";

    public ICollection<Venta> Ventas { get; set; } = new List<Venta>();
    public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
