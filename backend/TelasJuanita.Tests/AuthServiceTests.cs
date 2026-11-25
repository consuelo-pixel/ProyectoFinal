using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class AuthServiceTests
{
    private readonly IUsuarioRepository _usuarioRepoStub = Substitute.For<IUsuarioRepository>();
    private readonly ITokenService _tokenStub = Substitute.For<ITokenService>();

    private AuthService CrearServicio()
    {
        _tokenStub.CrearToken(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns("token-de-prueba");
        return new AuthService(_usuarioRepoStub, _tokenStub);
    }

    // Crea un usuario con la contraseña ya encriptada con BCrypt (factor 4 para que el test sea rápido)
    private static Usuario CrearUsuario(string password, string estado = "ACTIVO", int intentos = 0)
    {
        return new Usuario
        {
            IdUsuario = Guid.NewGuid(),
            Nombre = "Mariana Torrez",
            Correo = "vendedor@telasjuanita.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, 4),
            Estado = estado,
            IntentosFallidos = intentos,
            Rol = new Rol { Nombre = "Vendedor" }
        };
    }

    [Fact]
    public async Task IniciarSesion_CorreoNoExiste_RetornaFallo()
    {
        // Arrange
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns((Usuario?)null);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = "nadie@correo.com", Password = "123456" });

        // Assert
        resultado.Exito.Should().BeFalse();
        resultado.Token.Should().BeNull();
    }

    [Fact]
    public async Task IniciarSesion_PasswordCorrecta_RetornaTokenYRol()
    {
        // Arrange
        var usuario = CrearUsuario("Vendedor123#");
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(usuario);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = usuario.Correo, Password = "Vendedor123#" });

        // Assert
        resultado.Exito.Should().BeTrue();
        resultado.Token.Should().Be("token-de-prueba");
        resultado.Rol.Should().Be("Vendedor");
        await _usuarioRepoStub.Received(1).ResetearIntentosAsync(usuario.IdUsuario);
    }

    [Fact]
    public async Task IniciarSesion_PasswordIncorrecta_SumaUnIntentoFallido()
    {
        // Arrange
        var usuario = CrearUsuario("Vendedor123#");
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(usuario);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = usuario.Correo, Password = "claveMala1" });

        // Assert
        resultado.Exito.Should().BeFalse();
        resultado.IntentosRestantes.Should().Be(4);
        resultado.Token.Should().BeNull();
        await _usuarioRepoStub.Received(1).ActualizarIntentosFallidosAsync(usuario.IdUsuario, 1, null);
    }

    [Fact]
    public async Task IniciarSesion_QuintoIntentoFallido_BloqueaLaCuenta()
    {
        // Arrange
        var usuario = CrearUsuario("Vendedor123#", intentos: 4);
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(usuario);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = usuario.Correo, Password = "claveMala1" });

        // Assert
        resultado.Exito.Should().BeFalse();
        resultado.CuentaBloqueada.Should().BeTrue();
        await _usuarioRepoStub.Received(1).ActualizarIntentosFallidosAsync(usuario.IdUsuario, 5, "BLOQUEADO");
    }

    [Fact]
    public async Task IniciarSesion_CuentaBloqueadaVigente_NoDejaEntrarAunqueLaClaveSeaCorrecta()
    {
        // Arrange
        var usuario = CrearUsuario("Vendedor123#", estado: "BLOQUEADO", intentos: 5);
        usuario.BloqueadoHasta = DateTime.UtcNow.AddMinutes(10);
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(usuario);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = usuario.Correo, Password = "Vendedor123#" });

        // Assert
        resultado.Exito.Should().BeFalse();
        resultado.CuentaBloqueada.Should().BeTrue();
        _tokenStub.DidNotReceive().CrearToken(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task IniciarSesion_BloqueoYaVencido_PermiteEntrar()
    {
        // Arrange
        var usuario = CrearUsuario("Vendedor123#", estado: "BLOQUEADO", intentos: 5);
        usuario.BloqueadoHasta = DateTime.UtcNow.AddMinutes(-1);
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(usuario);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = usuario.Correo, Password = "Vendedor123#" });

        // Assert
        resultado.Exito.Should().BeTrue();
        resultado.Token.Should().Be("token-de-prueba");
    }

    [Fact]
    public async Task IniciarSesion_HashSinFormatoBCrypt_NoDejaEntrar()
    {
        // Arrange: contraseña guardada en texto plano (mal guardada)
        var usuario = CrearUsuario("Vendedor123#");
        usuario.PasswordHash = "Vendedor123#";
        _usuarioRepoStub.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(usuario);
        var sut = CrearServicio();

        // Act
        var resultado = await sut.IniciarSesionAsync(new LoginDto { Correo = usuario.Correo, Password = "Vendedor123#" });

        // Assert
        resultado.Exito.Should().BeFalse();
    }
}
