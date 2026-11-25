using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;
using TelasJuanita.Data;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class CajaServiceTests
{
    private readonly ICajaRepository _cajaRepoStub = Substitute.For<ICajaRepository>();

    [Fact]
    public async Task RealizarCierre_UsaLosTotalesCalculadosPorElServidor()
    {
        // Arrange: (efectivo, qr, transferencia, total, cantidad de ventas)
        _cajaRepoStub.ObtenerCierreDelDiaAsync(Arg.Any<DateOnly>()).Returns((CierreCaja?)null);
        _cajaRepoStub.CalcularTotalesDiaAsync(Arg.Any<DateOnly>()).Returns((100m, 30m, 50m, 180m, 4));
        _cajaRepoStub.RegistrarCierreAsync(Arg.Any<CierreCaja>()).Returns(call => call.Arg<CierreCaja>());
        var sut = new CajaService(_cajaRepoStub);

        // Act
        var (exito, _, cierre) = await sut.RealizarCierreCajaAsync(new RegistrarCierreCajaDto(), Guid.NewGuid(), "Mariana");

        // Assert
        exito.Should().BeTrue();
        cierre!.TotalEfectivo.Should().Be(100m);
        cierre.TotalQr.Should().Be(30m);
        cierre.TotalTransferencia.Should().Be(50m);
        cierre.TotalGeneral.Should().Be(180m);
        cierre.Usuario.Should().Be("Mariana");
    }

    [Fact]
    public async Task RealizarCierre_YaCerradoHoy_RetornaError()
    {
        // Arrange
        _cajaRepoStub.ObtenerCierreDelDiaAsync(Arg.Any<DateOnly>()).Returns(new CierreCaja());
        var sut = new CajaService(_cajaRepoStub);

        // Act
        var (exito, error, _) = await sut.RealizarCierreCajaAsync(new RegistrarCierreCajaDto(), Guid.NewGuid(), "Mariana");

        // Assert
        exito.Should().BeFalse();
        error.Should().Contain("ya fue registrado");
        await _cajaRepoStub.DidNotReceive().RegistrarCierreAsync(Arg.Any<CierreCaja>());
    }

    [Fact]
    public void HoraBolivia_RangoUtc_EmpiezaALas4DeLaMadrugadaUtc()
    {
        // Un día en Bolivia (UTC-4) empieza a las 04:00 UTC y dura 24 horas
        var (inicio, fin) = HoraBolivia.RangoUtc(new DateOnly(2026, 11, 23));

        inicio.Should().Be(new DateTime(2026, 11, 23, 4, 0, 0, DateTimeKind.Utc));
        fin.Should().Be(new DateTime(2026, 11, 24, 4, 0, 0, DateTimeKind.Utc));
    }
}
