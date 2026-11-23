using System.ComponentModel.DataAnnotations;

namespace TelasJuanita.Business.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "Formato de correo no válido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public bool Exito { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public string? Token { get; set; }
    public string? Nombre { get; set; }
    public string? Correo { get; set; }
    public string? Rol { get; set; }
    public int IntentosRestantes { get; set; } = 5;
    public bool CuentaBloqueada { get; set; } = false;
}
