import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow">
            TJ
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">Telas Juanita</h1>
            <p className="text-xs text-gray-500">Tarija, Bolivia</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition ${
              isActive('/')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            Monitor Base
          </Link>

          <Link
            to="/clientes"
            className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition ${
              isActive('/clientes')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            Clientes
          </Link>

          <Link
            to="/telas"
            className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition ${
              isActive('/telas')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            Telas & Stock
          </Link>

          <Link
            to="/catalogo"
            className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition ${
              isActive('/catalogo')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            Catálogo
          </Link>

          <Link
            to="/testing"
            className={`text-xs sm:text-sm font-bold px-3 py-2 rounded-lg transition border ${
              isActive('/testing')
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            🧪 Testing Lab
          </Link>

          <Link
            to="/login"
            className="text-xs sm:text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition px-3.5 py-2 rounded-lg shadow-sm ml-2"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};
