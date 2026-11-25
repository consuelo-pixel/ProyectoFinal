using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class CobranzaServiceTests
{
    private readonly ICobranzaRepository _cobranzaRepoStub = Substitute.For<ICobranzaRepository>();

    private static Venta CrearVentaCredito(decimal saldo, string estado = "REGISTRADA")
    {
        return new Venta
        {
            IdVenta = 10,
            EsCredito = true,
            Estado = estado,
            Total = 500m,
            SaldoPendiente = saldo,
            Cliente = new Cliente { Nombre = "María Morales", Carnet = "5849302" }
        };
    }

    [Fact]
    public async Task RegistrarAbono_MontoCero_RetornaError()
    {
        var sut = new CobranzaService(_cobranzaRepoStub);

        var (exito, error, _) = await sut.RegistrarAbonoAsync(
            new RegistrarAbonoDto { IdVenta = 10, Monto = 0, MetodoPago = "EFECTIVO" }, Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("mayor a 0");
    }

    [Fact]
    public async Task RegistrarAbono_VentaInexistente_RetornaError()
    {
        _cobranzaRepoStub.ObtenerVentaConClienteAsync(10).Returns((Venta?)null);
        var sut = new CobranzaService(_cobranzaRepoStub);

        var (exito, error, _) = await sut.RegistrarAbonoAsync(
            new RegistrarAbonoDto { IdVenta = 10, Monto = 50, MetodoPago = "EFECTIVO" }, Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("No se encontró");
    }

    [Fact]
    public async Task RegistrarAbono_VentaAnulada_RetornaError()
    {
        _cobranzaRepoStub.ObtenerVentaConClienteAsync(10).Returns(CrearVentaCredito(200m, "ANULADA"));
        var sut = new CobranzaService(_cobranzaRepoStub);

        var (exito, error, _) = await sut.RegistrarAbonoAsync(
            new RegistrarAbonoDto { IdVenta = 10, Monto = 50, MetodoPago = "EFECTIVO" }, Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("anulada");
    }

    [Fact]
    public async Task RegistrarAbono_MayorAlSaldo_RetornaErrorYNoGuarda()
    {
        _cobranzaRepoStub.ObtenerVentaConClienteAsync(10).Returns(CrearVentaCredito(100m));
        var sut = new CobranzaService(_cobranzaRepoStub);

        var (exito, error, _) = await sut.RegistrarAbonoAsync(
            new RegistrarAbonoDto { IdVenta = 10, Monto = 150, MetodoPago = "EFECTIVO" }, Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("excede el saldo");
        await _cobranzaRepoStub.DidNotReceive().RegistrarAbonoAsync(Arg.Any<Abono>());
    }

    [Fact]
    public async Task RegistrarAbono_MontoValido_RetornaComprobanteConSaldoRestante()
    {
        _cobranzaRepoStub.ObtenerVentaConClienteAsync(10).Returns(CrearVentaCredito(200m));
        _cobranzaRepoStub.RegistrarAbonoAsync(Arg.Any<Abono>()).Returns(call => call.Arg<Abono>());
        var sut = new CobranzaService(_cobranzaRepoStub);

        var (exito, error, comprobante) = await sut.RegistrarAbonoAsync(
            new RegistrarAbonoDto { IdVenta = 10, Monto = 50, MetodoPago = "qr" }, Guid.NewGuid(), "Mariana");

        exito.Should().BeTrue();
        error.Should().BeNull();
        comprobante!.SaldoAnterior.Should().Be(200m);
        comprobante.SaldoRestante.Should().Be(150m);
        comprobante.MetodoPago.Should().Be("QR");
        comprobante.CobradoPor.Should().Be("Mariana");
    }
}
