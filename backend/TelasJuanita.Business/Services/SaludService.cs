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
        var (conecto, errorDb) = await _saludRepository.ProbarConexionAsync();
        if (!conecto)
        {
            return new SaludResponseDto
            {
                Estado = "ERROR",
                Mensaje = $"No se pudo conectar a PostgreSQL: {errorDb}",
                BaseDeDatos = "Desconectada"
            };
        }

        try
        {
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
        catch (Exception ex)
        {
            return new SaludResponseDto
            {
                Estado = "ERROR",
                Mensaje = $"Conectó a la base de datos pero falló al consultar tablas: {ex.Message}",
                BaseDeDatos = "Conectada (sin tablas o sin permisos)"
            };
        }
    }
}
