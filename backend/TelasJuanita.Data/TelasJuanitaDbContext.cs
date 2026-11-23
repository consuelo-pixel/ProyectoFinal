using Microsoft.EntityFrameworkCore;
using TelasJuanita.Data.Entities;

namespace TelasJuanita.Data;

public class TelasJuanitaDbContext : DbContext
{
    public TelasJuanitaDbContext(DbContextOptions<TelasJuanitaDbContext> options) : base(options)
    {
    }

    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Permiso> Permisos => Set<Permiso>();
    public DbSet<RolPermiso> RolPermisos => Set<RolPermiso>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Tela> Telas => Set<Tela>();
    public DbSet<Proveedor> Proveedores => Set<Proveedor>();
    public DbSet<DescuentoMayor> DescuentosMayores => Set<DescuentoMayor>();
    public DbSet<HistorialPrecio> HistorialPrecios => Set<HistorialPrecio>();
    public DbSet<Compra> Compras => Set<Compra>();
    public DbSet<DetalleCompra> DetallesCompra => Set<DetalleCompra>();
    public DbSet<Rollo> Rollos => Set<Rollo>();
    public DbSet<MovimientoInventario> MovimientosInventario => Set<MovimientoInventario>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<DetallePedido> DetallesPedido => Set<DetallePedido>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<DetalleVenta> DetallesVenta => Set<DetalleVenta>();
    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<Abono> Abonos => Set<Abono>();
    public DbSet<Devolucion> Devoluciones => Set<Devolucion>();
    public DbSet<CierreCaja> CierresCaja => Set<CierreCaja>();
    public DbSet<RegistroAuditoria> RegistrosAuditoria => Set<RegistroAuditoria>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("telas");

        // Clave compuesta para RolPermiso
        modelBuilder.Entity<RolPermiso>()
            .HasKey(rp => new { rp.IdRol, rp.IdPermiso });

        modelBuilder.Entity<RolPermiso>()
            .HasOne(rp => rp.Rol)
            .WithMany(r => r.RolPermisos)
            .HasForeignKey(rp => rp.IdRol);

        modelBuilder.Entity<RolPermiso>()
            .HasOne(rp => rp.Permiso)
            .WithMany(p => p.RolPermisos)
            .HasForeignKey(rp => rp.IdPermiso);

        // Relaciones con integridad referencial restrictiva
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Rol)
            .WithMany(r => r.Usuarios)
            .HasForeignKey(u => u.IdRol)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Venta>()
            .HasOne(v => v.Cliente)
            .WithMany(c => c.Ventas)
            .HasForeignKey(v => v.IdCliente)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Venta>()
            .HasOne(v => v.Usuario)
            .WithMany()
            .HasForeignKey(v => v.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DetalleVenta>()
            .HasOne(dv => dv.Venta)
            .WithMany(v => v.Detalles)
            .HasForeignKey(dv => dv.IdVenta)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DetalleVenta>()
            .HasOne(dv => dv.Tela)
            .WithMany()
            .HasForeignKey(dv => dv.IdTela)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Rollo>()
            .HasOne(r => r.Tela)
            .WithMany(t => t.Rollos)
            .HasForeignKey(r => r.IdTela)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
