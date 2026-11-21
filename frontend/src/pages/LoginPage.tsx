import React, { useState } from 'react';
import { login, desbloquearUsuario } from '../services/authService';
import { LoginResponse } from '../types/auth';

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('admin@telasjuanita.local');
  const [password, setPassword] = useState('CambiarEstaClave#1');
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<LoginResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setRespuesta(null);
    try {
      const res = await login(correo, password);
      setRespuesta(res);
    } finally {
      setCargando(false);
    }
  };

  const handleDesbloquear = async () => {
    await desbloquearUsuario(correo);
    setRespuesta({
      exito: false,
      mensaje: 'Intentos restablecidos a 0 y cuenta desbloqueada. Lista para probar de nuevo.',
      intentosRestantes: 5,
      cuentaBloqueada: false
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Caja de ayuda para testing rápido */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold text-indigo-700 uppercase tracking-wide">🧪 Atajos para Testing de RF-29:</span>
          <p className="mt-0.5">Credenciales válidas: <code>admin@telasjuanita.local</code> / <code>CambiarEstaClave#1</code></p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setCorreo('admin@telasjuanita.local'); setPassword('CambiarEstaClave#1'); }}
            className="px-2.5 py-1.5 bg-white border border-indigo-300 rounded font-medium hover:bg-indigo-100 transition"
          >
            Poner Correcta
          </button>
          <button
            type="button"
            onClick={() => { setCorreo('admin@telasjuanita.local'); setPassword('clave_erronea_123'); }}
            className="px-2.5 py-1.5 bg-white border border-indigo-300 rounded font-medium hover:bg-indigo-100 transition"
          >
            Poner Errónea
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 mx-auto flex items-center justify-center text-white font-bold text-2xl shadow">
            TJ
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-1 text-xs text-gray-500">
            Control de Acceso y Bloqueo a 5 Intentos (RF-29 / RNF-08)
          </p>
        </div>

        {/* Mensaje de respuesta del backend */}
        {respuesta && (
          <div
            className={`mt-6 p-4 rounded-xl border text-sm ${
              respuesta.exito
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : respuesta.cuentaBloqueada
                ? 'bg-red-50 border-red-300 text-red-900 font-semibold'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{respuesta.exito ? '✅ Acceso Concedido' : respuesta.cuentaBloqueada ? '⛔ CUENTA BLOQUEADA' : '⚠️ Error de Acceso'}</p>
                <p className="mt-1 text-xs">{respuesta.mensaje}</p>
                {respuesta.exito && (
                  <p className="mt-2 text-xs font-mono bg-emerald-100/70 p-1.5 rounded">
                    Rol: {respuesta.rol} | Usuario: {respuesta.nombre}
                  </p>
                )}
                {!respuesta.exito && !respuesta.cuentaBloqueada && (
                  <p className="mt-2 text-xs font-semibold text-amber-900">
                    Intentos disponibles antes del bloqueo: {respuesta.intentosRestantes} de 5
                  </p>
                )}
              </div>
            </div>

            {/* Botón para reiniciar contador si se bloqueó */}
            {respuesta.cuentaBloqueada && (
              <button
                type="button"
                onClick={handleDesbloquear}
                className="mt-3 w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition"
              >
                Desbloquear Cuenta para seguir probando
              </button>
            )}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="admin@telasjuanita.local"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {cargando ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="pt-4 mt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Cierre de sesión automático tras 15 min de inactividad (RNF-13).
          </p>
        </div>
      </div>
    </div>
  );
};
