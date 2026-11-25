using FluentAssertions;
using NSubstitute;
using TelasJuanita.Business.DTOs;
using TelasJuanita.Business.Services;
using TelasJuanita.Data.Entities;
using TelasJuanita.Data.Repositories;
using Xunit;

namespace TelasJuanita.Tests;

public class VentaServiceTests
{
    private readonly IVentaRepository _ventaRepoStub = Substitute.For<IVentaRepository>();
    private readonly ITelaRepository _telaRepoStub = Substitute.For<ITelaRepository>();
    private readonly IClienteRepository _clienteRepoStub = Substitute.For<IClienteRepository>();

    private VentaService CrearServicio()
    {
        // La tela de prueba cuesta Bs. 10 el metro
        _telaRepoStub.ObtenerPorIdAsync(1).Returns(new Tela
        {
            IdTela = 1,
            Codigo = "TEL-001",
            Nombre = "Lino",
            PrecioMetro = 10m,
            Estado = "ACTIVA"
        });

        // El repositorio devuelve la misma venta que recibe
        _ventaRepoStub.RegistrarVentaAsync(Arg.Any<Venta>(), Arg.Any<List<DetalleVenta>>(), Arg.Any<Pago?>())
            .Returns(call => call.Arg<Venta>());

        return new VentaService(_ventaRepoStub, _telaRepoStub, _clienteRepoStub);
    }

    private static RegistrarVentaDto CrearVenta(decimal metros, string metodoPago = "EFECTIVO", int? idCliente = null)
    {
        return new RegistrarVentaDto
        {
            IdCliente = idCliente,
            MetodoPago = metodoPago,
            Lineas = new List<CrearLineaVentaDto>
            {
                new CrearLineaVentaDto { IdTela = 1, CantidadMetros = metros }
            }
        };
    }

    [Fact]
    public async Task RegistrarVenta_SinLineas_RetornaError()
    {
        var sut = CrearServicio();
        var dto = new RegistrarVentaDto { MetodoPago = "EFECTIVO", Lineas = new List<CrearLineaVentaDto>() };

        var (exito, error, nota) = await sut.RegistrarVentaAsync(dto, Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("al menos un corte");
        nota.Should().BeNull();
    }

    [Fact]
    public async Task RegistrarVenta_MetodoDePagoInvalido_RetornaError()
    {
        var sut = CrearServicio();

        var (exito, error, _) = await sut.RegistrarVentaAsync(CrearVenta(5, "BITCOIN"), Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("Método de pago");
    }

    [Fact]
    public async Task RegistrarVenta_CreditoSinCliente_RetornaError()
    {
        var sut = CrearServicio();

        var (exito, error, _) = await sut.RegistrarVentaAsync(CrearVenta(5, "CREDITO"), Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("cliente registrado");
    }

    [Fact]
    public async Task RegistrarVenta_MenosDe20Metros_NoAplicaDescuento()
    {
        var sut = CrearServicio();

        var (exito, _, nota) = await sut.RegistrarVentaAsync(CrearVenta(5), Guid.NewGuid(), "Mariana");

        exito.Should().BeTrue();
        nota!.Descuento.Should().Be(0m);
        nota.Total.Should().Be(50m);
    }

    [Fact]
    public async Task RegistrarVenta_20MetrosOMas_AplicaDescuentoDel10Porciento()
    {
        var sut = CrearServicio();

        var (exito, _, nota) = await sut.RegistrarVentaAsync(CrearVenta(20), Guid.NewGuid(), "Mariana");

        exito.Should().BeTrue();
        nota!.Subtotal.Should().Be(200m);
        nota.Descuento.Should().Be(20m);
        nota.Total.Should().Be(180m);
    }

    [Fact]
    public async Task RegistrarVenta_SinStock_RetornaElErrorDelRepositorio()
    {
        var sut = CrearServicio();
        _ventaRepoStub.RegistrarVentaAsync(Arg.Any<Venta>(), Arg.Any<List<DetalleVenta>>(), Arg.Any<Pago?>())
            .Returns(Task.FromException<Venta>(new InvalidOperationException("No hay stock suficiente")));

        var (exito, error, nota) = await sut.RegistrarVentaAsync(CrearVenta(5), Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Be("No hay stock suficiente");
        nota.Should().BeNull();
    }

    [Fact]
    public async Task RegistrarVenta_ClienteInactivo_RetornaError()
    {
        var sut = CrearServicio();
        _clienteRepoStub.ObtenerPorIdAsync(7).Returns(new Cliente { IdCliente = 7, Nombre = "Pedro", Estado = "INACTIVO" });

        var (exito, error, _) = await sut.RegistrarVentaAsync(CrearVenta(5, "EFECTIVO", 7), Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("no está activo");
    }

    [Fact]
    public async Task RegistrarVenta_CreditoQueSuperaElLimite_RetornaErrorYNoGuarda()
    {
        var sut = CrearServicio();
        _clienteRepoStub.ObtenerPorIdAsync(7).Returns(new Cliente { IdCliente = 7, Nombre = "Pedro", Estado = "ACTIVO", LimiteCredito = 100m });
        _ventaRepoStub.ObtenerDeudaClienteAsync(7).Returns(50m);

        // 8 metros x Bs. 10 = Bs. 80, más la deuda de 50 pasa el límite de 100
        var (exito, error, _) = await sut.RegistrarVentaAsync(CrearVenta(8, "CREDITO", 7), Guid.NewGuid(), "Mariana");

        exito.Should().BeFalse();
        error.Should().Contain("límite");
        await _ventaRepoStub.DidNotReceive().RegistrarVentaAsync(Arg.Any<Venta>(), Arg.Any<List<DetalleVenta>>(), Arg.Any<Pago?>());
    }

    [Fact]
    public async Task AnularVenta_RolVendedor_RetornaPermisoDenegado()
    {
        var sut = CrearServicio();

        var (exito, error) = await sut.AnularVentaAsync(new AnularVentaDto { IdVenta = 1, Motivo = "Error de digitación" }, Guid.NewGuid(), "Vendedor");

        exito.Should().BeFalse();
        error.Should().Contain("Permiso denegado");
        await _ventaRepoStub.DidNotReceive().AnularVentaAsync(Arg.Any<int>(), Arg.Any<string>(), Arg.Any<Guid>());
    }

    [Fact]
    public async Task AnularVenta_DuenaSinMotivo_RetornaError()
    {
        var sut = CrearServicio();

        var (exito, error) = await sut.AnularVentaAsync(new AnularVentaDto { IdVenta = 1, Motivo = "   " }, Guid.NewGuid(), "Dueña");

        exito.Should().BeFalse();
        error.Should().Contain("motivo");
    }

    [Fact]
    public async Task AnularVenta_DuenaConMotivo_AnulaLaVenta()
    {
        var sut = CrearServicio();
        _ventaRepoStub.AnularVentaAsync(1, "Error de digitación", Arg.Any<Guid>()).Returns(true);

        var (exito, error) = await sut.AnularVentaAsync(new AnularVentaDto { IdVenta = 1, Motivo = "Error de digitación" }, Guid.NewGuid(), "Dueña");

        exito.Should().BeTrue();
        error.Should().BeNull();
    }

    [Fact]
    public async Task RegistrarDevolucion_MasDeLoVendido_RetornaElErrorDelRepositorio()
    {
        var sut = CrearServicio();
        _ventaRepoStub.RegistrarDevolucionAsync(Arg.Any<Devolucion>())
            .Returns(Task.FromException<Devolucion>(new InvalidOperationException("Solo se pueden devolver 2 metros de este corte.")));

        var (exito, error) = await sut.RegistrarDevolucionAsync(
            new RegistrarDevolucionDto { IdDetalleVenta = 1, CantidadMetros = 5, Motivo = "Color incorrecto" }, Guid.NewGuid());

        exito.Should().BeFalse();
        error.Should().Contain("Solo se pueden devolver");
    }
}
