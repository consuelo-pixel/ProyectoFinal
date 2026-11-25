using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class AjustarInventarioTests
{
    private readonly ITelaRepository _telaRepoStub = Substitute.For<ITelaRepository>();

    private static AjustarInventarioDto CrearAjuste(string tipo = "DISMINUCION", string motivo = "Corte dañado")
    {
        return new AjustarInventarioDto { IdTela = 1, CantidadMetros = 3m, TipoOperacion = tipo, Motivo = motivo };
    }

    [Fact]
    public async Task AjustarInventario_SinMotivo_RetornaError()
    {
        var sut = new TelaService(_telaRepoStub);

        var (exito, error) = await sut.AjustarInventarioAsync(CrearAjuste(motivo: " "), Guid.NewGuid());

        exito.Should().BeFalse();
        error.Should().Contain("motivo");
    }

    [Fact]
    public async Task AjustarInventario_TipoDeOperacionInvalido_RetornaError()
    {
        var sut = new TelaService(_telaRepoStub);

        var (exito, error) = await sut.AjustarInventarioAsync(CrearAjuste(tipo: "REGALO"), Guid.NewGuid());

        exito.Should().BeFalse();
        error.Should().Contain("INCREMENTO o DISMINUCION");
    }

    [Fact]
    public async Task AjustarInventario_DejaElRolloEnNegativo_RetornaElErrorDelRepositorio()
    {
        _telaRepoStub.ObtenerPorIdAsync(1).Returns(new Tela { IdTela = 1 });
        _telaRepoStub.RegistrarAjusteInventarioAsync(Arg.Any<MovimientoInventario>(), Arg.Any<decimal>())
            .Returns(Task.FromException<bool>(new InvalidOperationException("El rollo solo tiene 2 metros")));
        var sut = new TelaService(_telaRepoStub);

        var (exito, error) = await sut.AjustarInventarioAsync(CrearAjuste(), Guid.NewGuid());

        exito.Should().BeFalse();
        error.Should().Contain("solo tiene 2 metros");
    }

    [Fact]
    public async Task AjustarInventario_Disminucion_EnviaDeltaNegativoAlRepositorio()
    {
        _telaRepoStub.ObtenerPorIdAsync(1).Returns(new Tela { IdTela = 1 });
        _telaRepoStub.RegistrarAjusteInventarioAsync(Arg.Any<MovimientoInventario>(), Arg.Any<decimal>()).Returns(true);
        var sut = new TelaService(_telaRepoStub);

        var (exito, _) = await sut.AjustarInventarioAsync(CrearAjuste(), Guid.NewGuid());

        exito.Should().BeTrue();
        await _telaRepoStub.Received(1).RegistrarAjusteInventarioAsync(Arg.Any<MovimientoInventario>(), -3m);
    }
}
