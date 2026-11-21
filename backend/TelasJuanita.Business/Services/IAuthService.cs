using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface IAuthService
{
    Task<LoginResponseDto> IniciarSesionAsync(LoginDto dto);
    Task<bool> DesbloquearUsuarioAsync(string correo);
}
