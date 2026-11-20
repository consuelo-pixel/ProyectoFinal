import React, { useEffect, useState } from 'react';
import { consultarSaludSistema } from '../services/saludService';
import { SaludResponse } from '../types/salud';

export const InicioPage: React.FC = () => {
  const [salud, setSalud] = useState<SaludResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const verificarConexion = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await consultarSaludSistema();
      setSalud(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudo contactar con el backend');
      }
      setSalud(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    verificarConexion();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-8 text-white shadow-lg">
        <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Fase 1: Base del Sistema (Día 1 - Día 3)
        </span>
        <h2 className="text-3xl font-extrabold mt-3 tracking-tight">
          Sistema de Gestión Telas Juanita
        </h2>
        <p className="mt-2 text-emerald-100 max-w-2xl text-sm sm:text-base">
          Arquitectura en tres capas con React (TypeScript), ASP.NET Core (.NET C#) y PostgreSQL.
          Control de inventario, ventas por metro, rollo y corte, clientes y seguridad con roles.
        </p>
      </div>

      {/* Monitor de Estado en Tiempo Real */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Estado de Conexión del Ecosistema</h3>
            <p className="text-sm text-gray-500">Prueba viva del endpoint /api/salud hacia PostgreSQL</p>
          </div>
          <button
            onClick={verificarConexion}
            disabled={cargando}
            className="self-start sm:self-auto inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {cargando ? 'Verificando...' : 'Reintentar Conexión'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Frontend */}
          <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Presentación Web</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                En Línea
              </span>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-2">Frontend React</p>
            <p className="text-xs text-gray-500 mt-1">Vite + TypeScript + Tailwind CSS</p>
            <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-gray-600">
              Puerto local: <strong>5173</strong>
            </div>
          </div>

          {/* Backend */}
          <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Lógica y API</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  salud
                    ? 'bg-green-100 text-green-800'
                    : cargando
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {salud ? 'Conectado' : cargando ? 'Consultando...' : 'Sin Conexión'}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-2">API ASP.NET Core</p>
            <p className="text-xs text-gray-500 mt-1">C# en 3 Capas (Api, Business, Data)</p>
            <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-gray-600">
              Endpoint: <code>/api/salud</code>
            </div>
          </div>

          {/* Base de Datos */}
          <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Almacenamiento</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  salud && salud.estado === 'OK'
                    ? 'bg-green-100 text-green-800'
                    : cargando
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {salud && salud.estado === 'OK'
                  ? 'Base Lista'
                  : cargando
                  ? 'Verificando...'
                  : 'Desconectada'}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-2">PostgreSQL</p>
            <p className="text-xs text-gray-500 mt-1">
              {salud ? salud.baseDeDatos : 'Esquema telas (telasjuanita)'}
            </p>
            <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-gray-600">
              Roles detectados: <strong>{salud ? salud.rolesRegistrados : 0}</strong> | Usuarios: <strong>{salud ? salud.usuariosRegistrados : 0}</strong>
            </div>
          </div>
        </div>

        {/* Mensaje de error si la API no está corriendo */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <p className="font-semibold">Aviso de comunicación:</p>
            <p className="mt-1">
              No se pudo conectar a <code>http://localhost:5000/api/salud</code> ({error}).
              Para probar la conexión en vivo, ejecuta el backend con:
            </p>
            <code className="block mt-2 bg-amber-100/80 p-2 rounded text-xs font-mono">
              dotnet run --project backend/TelasJuanita.Api
            </code>
          </div>
        )}
      </div>

      {/* Módulos preparados para Día 2 y Día 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Día 2</span>
          <h4 className="text-lg font-bold text-gray-900 mt-3">Seguridad y Roles (RF-29, RF-30)</h4>
          <p className="text-sm text-gray-600 mt-2">
            Autenticación JWT, contraseñas cifradas con BCrypt, bloqueo tras 5 intentos fallidos,
            cierre de sesión por inactividad a los 15 minutos y auditoría de solo inserción.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Día 3</span>
          <h4 className="text-lg font-bold text-gray-900 mt-3">Clientes y Telas (RF-01, RF-02, RF-07)</h4>
          <p className="text-sm text-gray-600 mt-2">
            Registro y búsqueda de clientes por nombre, carnet o NIT. Registro de telas con código, tipo,
            ancho, precio por metro y foto; deshabilitar telas en lugar de borrarlas.
          </p>
        </div>
      </div>
    </div>
  );
};
