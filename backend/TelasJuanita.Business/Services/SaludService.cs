using TelasJuanita.Business.DTOs;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class SaludService : ISaludService
{
    private readonly ISaludRepository _saludRepository;

    public SaludService(ISaludRepository saludRepository)
    {
        _saludRepository = saludRepository;
    }

    public async Task<SaludResponseDto> VerificarSaludAsync()
    {
        var conecto = await _saludRepository.PuedeConectarAsync();
        if (!conecto)
        {
            return new SaludResponseDto
            {
                Estado = "ERROR",
                Mensaje = "No se pudo establecer conexión con PostgreSQL",
                BaseDeDatos = "Desconectada"
            };
        }

        var roles = await _saludRepository.ObtenerTotalRolesAsync();
        var usuarios = await _saludRepository.ObtenerTotalUsuariosAsync();

        return new SaludResponseDto
        {
            Estado = "OK",
            Mensaje = "API y PostgreSQL conectados correctamente",
            BaseDeDatos = "PostgreSQL (esquema telas)",
            RolesRegistrados = roles,
            UsuariosRegistrados = usuarios,
            FechaUtc = DateTime.UtcNow
        };
    }
}
