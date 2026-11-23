import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, RolUsuario } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { usuario, cerrarSesion, cambiarRolDemo } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Barra superior de simulación de rol (para demostración rápida de permisos) */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rol activo:</span>
          {usuario ? (
            <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
              usuario.rol === 'Dueña' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
              usuario.rol === 'Vendedor' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' :
              usuario.rol === 'Almacen' ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30' :
              'bg-purple-400/20 text-purple-300 border border-purple-400/30'
            }`}>
              {usuario.rol === 'Dueña' ? '👑 Dueña (Acceso Total)' :
               usuario.rol === 'Vendedor' ? '💼 Vendedora (Mostrador)' :
               usuario.rol === 'Almacen' ? '📦 Almacén (Inventario)' :
               '🛍️ Cliente (Catálogo y Pedidos)'}
            </span>
          ) : (
            <span className="text-slate-400 italic">Sin sesión (Visitante público)</span>
          )}
        </div>

        {/* Selector de rol para probar cada vista al instante */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 hidden sm:inline">Probar vista como:</span>
          {(['Dueña', 'Vendedor', 'Almacen', 'Cliente'] as RolUsuario[]).map((r) => (
            <button
              key={r}
              onClick={() => cambiarRolDemo(r)}
              className={`px-2 py-0.5 rounded transition font-semibold ${
                usuario?.rol === r
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Marca de la tienda */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            TJ
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 leading-tight tracking-tight">Telas Juanita</h1>
            <p className="text-xs text-emerald-700 font-medium">Tienda Textil • Tarija</p>
          </div>
        </Link>

        {/* Menú adaptativo según rol */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* 1. Inicio: visible para todos */}
          <Link
            to="/"
            className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
              isActive('/') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            Inicio
          </Link>

          {/* 2. Catálogo: visible para todos */}
          <Link
            to="/catalogo"
            className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
              isActive('/catalogo') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            Catálogo
          </Link>

          {/* 3. Módulo de Ventas: Dueña y Vendedor */}
          {(!usuario || usuario.rol === 'Dueña' || usuario.rol === 'Vendedor') && (
            <Link
              to="/ventas"
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
                isActive('/ventas') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Ventas
            </Link>
          )}

          {/* 4. Clientes: Dueña y Vendedor */}
          {(!usuario || usuario.rol === 'Dueña' || usuario.rol === 'Vendedor') && (
            <Link
              to="/clientes"
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
                isActive('/clientes') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Clientes
            </Link>
          )}

          {/* 5. Inventario de Telas: Dueña y Almacén */}
          {(!usuario || usuario.rol === 'Dueña' || usuario.rol === 'Almacen') && (
            <Link
              to="/telas"
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
                isActive('/telas') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Inventario
            </Link>
          )}

          {/* 6. Proveedores & Rollos: Dueña y Almacén */}
          {(usuario?.rol === 'Dueña' || usuario?.rol === 'Almacen') && (
            <Link
              to="/almacen"
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
                isActive('/almacen') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Rollos & Proveedores
            </Link>
          )}

          {/* 7. Mis Pedidos & Saldo: Exclusivo del Cliente */}
          {usuario?.rol === 'Cliente' && (
            <Link
              to="/mis-pedidos"
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition ${
                isActive('/mis-pedidos') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Mis Pedidos y Saldo
            </Link>
          )}

          {/* 8. Panel de Administración & Roles: Exclusivo de la Dueña */}
          {usuario?.rol === 'Dueña' && (
            <Link
              to="/admin"
              className={`text-xs sm:text-sm font-bold px-3 py-2 rounded-lg transition border ${
                isActive('/admin')
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              👑 Administración
            </Link>
          )}

          {/* Botón de acceso o perfil */}
          {usuario ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <span className="text-xs text-slate-600 font-bold hidden md:inline">
                {usuario.nombre.split(' ')[0]}
              </span>
              <button
                onClick={cerrarSesion}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition px-4 py-2 rounded-xl shadow-sm ml-2"
            >
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
