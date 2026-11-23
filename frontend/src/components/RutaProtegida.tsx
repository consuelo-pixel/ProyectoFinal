import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth, RolUsuario } from '../context/AuthContext';

interface RutaProtegidaProps {
  rolesPermitidos: RolUsuario[];
  children: React.ReactElement;
}

export const RutaProtegida: React.FC<RutaProtegidaProps> = ({ rolesPermitidos, children }) => {
  const { usuario, cargando, tienePermiso } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm">
        Verificando permisos de acceso...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!tienePermiso(rolesPermitidos)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-sm">
          ⛔
        </div>
        <h2 className="text-2xl font-black text-slate-900">Acceso No Autorizado</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Tu cuenta actual está asignada al rol <strong className="text-slate-900">{usuario.rol}</strong>, el cual no cuenta con privilegios para acceder a este módulo.
        </p>
        <p className="text-xs text-slate-400">
          Módulos restringidos por control de acceso por rol en servidor y cliente (RNF-09).
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition"
          >
            ← Volver a mi panel permitido
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
