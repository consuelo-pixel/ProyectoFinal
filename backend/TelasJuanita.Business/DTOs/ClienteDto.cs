using System.ComponentModel.DataAnnotations;

namespace TelasJuanita.Business.DTOs;

public class ClienteDto
{
    public int IdCliente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Carnet { get; set; } = string.Empty;
    public string? Nit { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public decimal LimiteCredito { get; set; }
    public string Estado { get; set; } = "ACTIVO";
}

public class CrearClienteDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El carnet de identidad es obligatorio")]
    [StringLength(20, MinimumLength = 4, ErrorMessage = "El carnet debe tener entre 4 y 20 caracteres")]
    public string Carnet { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Nit { get; set; }

    [StringLength(20)]
    public string? Telefono { get; set; }

    [StringLength(200)]
    public string? Direccion { get; set; }

    [Range(0, 100000, ErrorMessage = "El límite de crédito no puede ser negativo")]
    public decimal LimiteCredito { get; set; } = 0m;
}
