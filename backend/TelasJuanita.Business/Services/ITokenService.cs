namespace TelasJuanita.Business.Services;

// La implementación vive en el proyecto Api (ahí está la configuración del JWT)
public interface ITokenService
{
    string CrearToken(Guid idUsuario, string nombre, string correo, string rol);
}
