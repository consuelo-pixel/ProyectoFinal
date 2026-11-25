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
        var (conecto, _) = await _saludRepository.ProbarConexionAsync();
        if (!conecto)
        {
            return new SaludResponseDto
            {
                Estado = "ERROR",
                Mensaje = "No se pudo conectar a PostgreSQL.",
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
        catch (Exception)
        {
            return new SaludResponseDto
            {
                Estado = "ERROR",
                Mensaje = "Conectó a la base de datos pero falló al consultar las tablas (revise que el esquema esté creado y los permisos).",
                BaseDeDatos = "Conectada (sin tablas o sin permisos)"
            };
        }
    }
}
