using System.ComponentModel.DataAnnotations;

namespace TelasJuanita.Business.DTOs;

public class TelaDto
{
    public int IdTela { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Tipo { get; set; }
    public string? Color { get; set; }
    public decimal? Ancho { get; set; }
    public decimal PrecioMetro { get; set; }
    public decimal StockMinimo { get; set; }
    public string? UrlFoto { get; set; }
    public string Estado { get; set; } = "ACTIVA";
    public decimal MetrosDisponibles { get; set; }
}

public class CrearTelaDto
{
    [Required(ErrorMessage = "El código de tela es obligatorio")]
    [StringLength(30, MinimumLength = 2, ErrorMessage = "El código debe tener entre 2 y 30 caracteres")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre de la tela es obligatorio")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Tipo { get; set; }

    [StringLength(40)]
    public string? Color { get; set; }

    [Range(0.1, 10.0, ErrorMessage = "El ancho debe ser mayor a 0 metros")]
    public decimal? Ancho { get; set; }

    [Required(ErrorMessage = "El precio por metro es obligatorio")]
    [Range(0.01, 10000.0, ErrorMessage = "El precio por metro debe ser mayor a 0")]
    public decimal PrecioMetro { get; set; }

    [Range(0, 10000.0, ErrorMessage = "El stock mínimo no puede ser negativo")]
    public decimal StockMinimo { get; set; } = 0m;

    [StringLength(300)]
    public string? UrlFoto { get; set; }
}
