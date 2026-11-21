import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
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

        {/* Enlaces de la tienda */}
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/"
            className={`text-sm font-semibold px-3 py-2 rounded-lg transition ${
              isActive('/')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            Inicio
          </Link>

          <Link
            to="/catalogo"
            className={`text-sm font-semibold px-3 py-2 rounded-lg transition ${
              isActive('/catalogo')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            Catálogo de Telas
          </Link>

          <Link
            to="/telas"
            className={`text-sm font-semibold px-3 py-2 rounded-lg transition ${
              isActive('/telas')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            Inventario
          </Link>

          <Link
            to="/clientes"
            className={`text-sm font-semibold px-3 py-2 rounded-lg transition ${
              isActive('/clientes')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            Clientes
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition px-4 py-2.5 rounded-xl shadow-sm ml-2"
          >
            Ingreso Personal
          </Link>
        </nav>
      </div>
    </header>
  );
};
