
using System;
using TelasJuanita.Data.Entities;
using Xunit;

namespace TelasJuanita.Tests;

public class RolloTests
{
    [Fact]
    public void Un_rollo_con_20_metros_al_descontar_5_queda_con_15()
    {
        // Arrange
        var rollo = new Rollo
        {
            MetrosIniciales = 20m,
            MetrosDisponibles = 20m
        };

        // Act
        rollo.DescontarMetros(5m);

        // Assert
        Assert.Equal(15m, rollo.MetrosDisponibles);
    }

    [Fact]
    public void No_se_puede_descontar_mas_del_stock_disponible()
    {
        // Arrange
        var rollo = new Rollo
        {
            MetrosIniciales = 20m,
            MetrosDisponibles = 20m
        };

        // Act
        Action accion = () => rollo.DescontarMetros(25m);

        // Assert
        Assert.Throws<InvalidOperationException>(accion);
        Assert.Equal(20m, rollo.MetrosDisponibles);
    }
}
