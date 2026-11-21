import React, { useState } from 'react';
import { login } from '../services/authService';
import { LoginResponse } from '../types/auth';

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<LoginResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setRespuesta(null);
    try {
      const res = await login(correo, password);
      setRespuesta(res);
      if (res.exito) {
        // Redirección o confirmación de acceso
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-md">
            TJ
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">Portal del Personal</h2>
          <p className="mt-1 text-xs text-slate-500">
            Ingreso autorizado para ventas, almacén y administración
          </p>
        </div>

        {respuesta && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              respuesta.exito
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : respuesta.cuentaBloqueada
                ? 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <p className="font-bold">{respuesta.exito ? 'Acceso Autorizado' : 'Atención'}</p>
            <p className="mt-0.5 text-xs">{respuesta.mensaje}</p>
            {respuesta.exito && (
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                Bienvenida/o, {respuesta.nombre} ({respuesta.rol})
              </p>
            )}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="usuario@telasjuanita.local"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contraseña
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm mt-2"
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Telas Juanita • Sistema de Control y Ventas
        </div>
      </div>
    </div>
  );
};
