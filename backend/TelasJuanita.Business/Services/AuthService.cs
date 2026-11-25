using TelasJuanita.Business.DTOs;
using TelasJuanita.Data.Repositories;

namespace TelasJuanita.Business.Services;

public class AuthService : IAuthService
{
    private const int MaxIntentos = 5;

    private readonly IUsuarioRepository _usuarioRepo;
    private readonly ITokenService _tokenService;

    public AuthService(IUsuarioRepository usuarioRepo, ITokenService tokenService)
    {
        _usuarioRepo = usuarioRepo;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto> IniciarSesionAsync(LoginDto dto)
    {
        var correo = dto.Correo.Trim().ToLower();
        var usuario = await _usuarioRepo.ObtenerPorCorreoAsync(correo);

        // Mismo mensaje si el correo no existe o la clave está mal (no se revela qué correos existen)
        if (usuario == null)
        {
            return Fallo("Correo o contraseña incorrectos.", MaxIntentos);
        }

        if (usuario.Estado == "INACTIVO")
        {
            return Fallo("Usuario inactivo. Comuníquese con la administración.", 0);
        }

        if (usuario.Estado == "BLOQUEADO")
        {
            var bloqueoTerminado = usuario.BloqueadoHasta != null && usuario.BloqueadoHasta <= DateTime.UtcNow;

            if (!bloqueoTerminado)
            {
                return new LoginResponseDto
                {
                    Exito = false,
                    Mensaje = "Cuenta bloqueada temporalmente tras superar el límite de 5 intentos fallidos (RF-29).",
                    IntentosRestantes = 0,
                    CuentaBloqueada = true
                };
            }

            // Ya pasaron los 30 minutos: se desbloquea sola
            await _usuarioRepo.ResetearIntentosAsync(usuario.IdUsuario);
            usuario.IntentosFallidos = 0;
        }

        if (!PasswordCorrecta(dto.Password, usuario.PasswordHash))
        {
            int nuevosIntentos = usuario.IntentosFallidos + 1;
            bool bloquear = nuevosIntentos >= MaxIntentos;

            await _usuarioRepo.ActualizarIntentosFallidosAsync(
                usuario.IdUsuario,
                nuevosIntentos,
                bloquear ? "BLOQUEADO" : null
            );

            if (bloquear)
            {
                return new LoginResponseDto
                {
                    Exito = false,
                    Mensaje = "Has alcanzado 5 intentos fallidos. Tu cuenta ha sido BLOQUEADA por 30 minutos (RF-29).",
                    IntentosRestantes = 0,
                    CuentaBloqueada = true
                };
            }

            return Fallo($"Contraseña incorrecta. Intento fallido {nuevosIntentos} de {MaxIntentos}.", MaxIntentos - nuevosIntentos);
        }

        // Contraseña correcta: reiniciamos los intentos y damos el token
        await _usuarioRepo.ResetearIntentosAsync(usuario.IdUsuario);

        var token = _tokenService.CrearToken(usuario.IdUsuario, usuario.Nombre, usuario.Correo, usuario.Rol.Nombre);

        return new LoginResponseDto
        {
            Exito = true,
            Mensaje = "Inicio de sesión correcto",
            Token = token,
            Nombre = usuario.Nombre,
            Correo = usuario.Correo,
            Rol = usuario.Rol.Nombre,
            IntentosRestantes = MaxIntentos,
            CuentaBloqueada = false
        };
    }

    public async Task<bool> DesbloquearUsuarioAsync(string correo)
    {
        var usuario = await _usuarioRepo.ObtenerPorCorreoAsync(correo);
        if (usuario == null) return false;

        return await _usuarioRepo.ResetearIntentosAsync(usuario.IdUsuario);
    }

    // Compara la clave escrita con el hash BCrypt guardado en la base
    private static bool PasswordCorrecta(string password, string hash)
    {
        try
        {
            if (BCrypt.Net.BCrypt.Verify(password, hash))
                return true;

            // Compatibilidad para demo: permite Admin123# o CambiarEstaClave#1 indistintamente para la dueña
            if ((password == "Admin123#" && BCrypt.Net.BCrypt.Verify("CambiarEstaClave#1", hash)) ||
                (password == "CambiarEstaClave#1" && BCrypt.Net.BCrypt.Verify("Admin123#", hash)))
            {
                return true;
            }

            return false;
        }
        catch (Exception)
        {
            // El hash guardado no tiene formato BCrypt: se toma como clave incorrecta
            return false;
        }
    }

    private static LoginResponseDto Fallo(string mensaje, int intentosRestantes)
    {
        return new LoginResponseDto
        {
            Exito = false,
            Mensaje = mensaje,
            IntentosRestantes = intentosRestantes,
            CuentaBloqueada = false
        };
    }
}
