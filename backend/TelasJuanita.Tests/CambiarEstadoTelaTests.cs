using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.Services;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class CambiarEstadoTelaTests
{
    [Theory]
    [InlineData("ACTIVA", "ACTIVA")]
    [InlineData("activa", "ACTIVA")]
    [InlineData("  deshabilitada  ", "DESHABILITADA")]
    public async Task CambiarEstado_EstadoValido_NormalizaYGuardaElEstado(string estadoIngresado, string estadoEsperado)
    {
        // Arrange
        var telaRepoStub = Substitute.For<ITelaRepository>();
        telaRepoStub.CambiarEstadoAsync(Arg.Any<int>(), Arg.Any<string>()).Returns(true);
        var sut = new TelaService(telaRepoStub);

        // Act
        var (exito, error) = await sut.CambiarEstadoAsync(1, estadoIngresado);

        // Assert
        exito.Should().BeTrue();
        error.Should().BeNull();
        await telaRepoStub.Received(1).CambiarEstadoAsync(1, estadoEsperado);
    }

    [Theory]
    [InlineData("ELIMINADA")]
    [InlineData("")]
    [InlineData("xyz")]
    public async Task CambiarEstado_EstadoInvalido_RetornaErrorYNoGuarda(string estadoInvalido)
    {
        // Arrange
        var telaRepoStub = Substitute.For<ITelaRepository>();
        var sut = new TelaService(telaRepoStub);

        // Act
        var (exito, error) = await sut.CambiarEstadoAsync(1, estadoInvalido);

        // Assert
        exito.Should().BeFalse();
        error.Should().Contain("ACTIVA");
        await telaRepoStub.DidNotReceive().CambiarEstadoAsync(Arg.Any<int>(), Arg.Any<string>());
    }

    [Fact]
    public async Task CambiarEstado_TelaInexistente_RetornaTelaNoEncontrada()
    {
        // Arrange
        var telaRepoStub = Substitute.For<ITelaRepository>();
        telaRepoStub.CambiarEstadoAsync(99, "ACTIVA").Returns(false);
        var sut = new TelaService(telaRepoStub);

        // Act
        var (exito, error) = await sut.CambiarEstadoAsync(99, "ACTIVA");

        // Assert
        exito.Should().BeFalse();
        error.Should().Be("Tela no encontrada");
    }
}