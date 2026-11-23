namespace TelasJuanita.Business.DTOs;

public class SaludResponseDto
{
    public string Estado { get; set; } = "OK";
    public string Mensaje { get; set; } = string.Empty;
    public string BaseDeDatos { get; set; } = string.Empty;
    public int RolesRegistrados { get; set; }
    public int UsuariosRegistrados { get; set; }
    public DateTime FechaUtc { get; set; } = DateTime.UtcNow;
}
