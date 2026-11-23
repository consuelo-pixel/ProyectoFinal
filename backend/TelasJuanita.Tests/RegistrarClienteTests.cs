using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class RegistrarClienteTests
{
    [Fact]
    public async Task RegistrarCliente_CarnetNuevo_RetornaExitoYCreaCliente()
    {
        // Arrange
        var clienteRepoStub = Substitute.For<IClienteRepository>();
        clienteRepoStub.ExisteCarnetAsync(Arg.Any<string>(), Arg.Any<int?>()).Returns(false);
        clienteRepoStub.CrearAsync(Arg.Any<Cliente>()).Returns(call => call.Arg<Cliente>());
        var sut = new ClienteService(clienteRepoStub);
        var dto = new CrearClienteDto
        {
            Nombre = "María Morales",
            Carnet = "5849302",
            LimiteCredito = 1500
        };

        // Act
        var (exito, error, cliente) = await sut.RegistrarClienteAsync(dto);

        // Assert
        exito.Should().BeTrue();
        error.Should().BeNull();
        cliente.Should().NotBeNull();
        cliente!.Estado.Should().Be("ACTIVO");
        await clienteRepoStub.Received(1).CrearAsync(Arg.Any<Cliente>());
    }

    [Fact]
    public async Task RegistrarCliente_CarnetRepetido_RetornaErrorYNoCreaCliente()
    {
        // Arrange
        var clienteRepoStub = Substitute.For<IClienteRepository>();
        clienteRepoStub.ExisteCarnetAsync(Arg.Any<string>(), Arg.Any<int?>()).Returns(true);
        var sut = new ClienteService(clienteRepoStub);
        var dto = new CrearClienteDto
        {
            Nombre = "María Morales",
            Carnet = "5849302"
        };

        // Act
        var (exito, error, cliente) = await sut.RegistrarClienteAsync(dto);

        // Assert
        exito.Should().BeFalse();
        error.Should().Contain("5849302");
        cliente.Should().BeNull();
        await clienteRepoStub.DidNotReceive().CrearAsync(Arg.Any<Cliente>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RegistrarCliente_NitVacio_GuardaNitComoNulo(string? nitVacio)
    {
        // Arrange
        var clienteRepoStub = Substitute.For<IClienteRepository>();
        clienteRepoStub.ExisteCarnetAsync(Arg.Any<string>(), Arg.Any<int?>()).Returns(false);
        clienteRepoStub.CrearAsync(Arg.Any<Cliente>()).Returns(call => call.Arg<Cliente>());
        var sut = new ClienteService(clienteRepoStub);
        var dto = new CrearClienteDto
        {
            Nombre = "Carlos Benítez",
            Carnet = "4930291",
            Nit = nitVacio
        };

        // Act
        var (_, _, cliente) = await sut.RegistrarClienteAsync(dto);

        // Assert
        cliente!.Nit.Should().BeNull();
    }
}