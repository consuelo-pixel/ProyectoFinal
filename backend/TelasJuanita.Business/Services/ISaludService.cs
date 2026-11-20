using TelasJuanita.Business.DTOs;

namespace TelasJuanita.Business.Services;

public interface ISaludService
{
    Task<SaludResponseDto> VerificarSaludAsync();
}
