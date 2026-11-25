using System.Security.Claims;

namespace TelasJuanita.Api;

// Atajos para sacar los datos del usuario que viene en el token
public static class UsuarioActual
{
    public static Guid ObtenerId(this ClaimsPrincipal user)
    {
        var valor = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(valor!);
    }

    public static string ObtenerNombre(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Name)?.Value ?? "Usuario";
    }

    public static string ObtenerRol(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value ?? "";
    }
}
