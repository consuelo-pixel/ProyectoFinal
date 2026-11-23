import React, { useState } from 'react';

interface UsuarioAdmin {
  id: string;
  nombre: string;
  correo: string;
  rol: 'Dueña' | 'Vendedor' | 'Almacen' | 'Cliente';
  estado: 'ACTIVO' | 'BLOQUEADO';
  ultimoAcceso: string;
}

export const AdminPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([
    { id: '1', nombre: 'Juanita Pérez', correo: 'admin@telasjuanita.local', rol: 'Dueña', estado: 'ACTIVO', ultimoAcceso: 'Hoy 15:40' },
    { id: '2', nombre: 'Mariana Torrez', correo: 'vendedor@telasjuanita.local', rol: 'Vendedor', estado: 'ACTIVO', ultimoAcceso: 'Hoy 14:12' },
    { id: '3', nombre: 'Gonzalo Choque', correo: 'almacen@telasjuanita.local', rol: 'Almacen', estado: 'ACTIVO', ultimoAcceso: 'Ayer 18:30' },
    { id: '4', nombre: 'Mario Benítez', correo: 'mario.vendedor@telasjuanita.local', rol: 'Vendedor', estado: 'BLOQUEADO', ultimoAcceso: 'Hace 3 días' }
  ]);

  const [auditoria] = useState([
    { accion: 'LOGIN_OK', usuario: 'admin@telasjuanita.local', entidad: 'usuario', fecha: '23/11/2026 15:40' },
    { accion: 'VENTA_REGISTRADA', usuario: 'Mariana Torrez', entidad: 'venta', fecha: '23/11/2026 15:32' },
    { accion: 'TELA_PRECIO_MODIFICADO', usuario: 'Juanita Pérez', entidad: 'tela', fecha: '23/11/2026 14:10' },
    { accion: 'INGRESO_ROLLO', usuario: 'Gonzalo Choque', entidad: 'rollo', fecha: '23/11/2026 11:05' }
  ]);

  const toggleEstado = (id: string) => {
    setUsuarios(usuarios.map(u => {
      if (u.id === id) {
        return { ...u, estado: u.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO' };
      }
      return u;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado Dueña */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-amber-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            👑 Módulo de Administración y Dueña (Acceso Total)
          </span>
          <h2 className="text-3xl font-black mt-2 tracking-tight">Panel de Control General</h2>
          <p className="mt-1 text-amber-100 text-sm max-w-2xl">
            Gestión de usuarios y roles, definición de precios por mayor, auditoría inmutable de transacciones y cierres de caja.
          </p>
        </div>
      </div>

      {/* Métricas Ejecutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Ventas del Día</p>
          <p className="text-2xl font-black text-slate-900 mt-1">Bs. 3,840.00</p>
          <span className="text-xs text-emerald-700 font-bold">14 notas emitidas</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Saldos por Cobrar (Crédito)</p>
          <p className="text-2xl font-black text-rose-700 mt-1">Bs. 5,200.00</p>
          <span className="text-xs text-rose-600 font-bold">6 clientes con fiado activo</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Existencias en Rollo</p>
          <p className="text-2xl font-black text-slate-900 mt-1">1,240.5 m</p>
          <span className="text-xs text-emerald-700 font-bold">3 telas bajo stock mínimo</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Personal Activo</p>
          <p className="text-2xl font-black text-slate-900 mt-1">4 usuarios</p>
          <span className="text-xs text-slate-500 font-bold">Roles: Dueña, Ventas, Almacén</span>
        </div>
      </div>

      {/* Gestión de Usuarios y Roles (RF-30) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Usuarios y Permisos del Personal</h3>
            <p className="text-xs text-slate-500">Control de acceso y asignación de perfiles (Dueña, Vendedora, Almacén).</p>
          </div>
        </div>

        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-left">Usuario</th>
              <th className="px-6 py-3.5 text-left">Correo</th>
              <th className="px-6 py-3.5 text-left">Rol Asignado</th>
              <th className="px-6 py-3.5 text-left">Estado</th>
              <th className="px-6 py-3.5 text-left">Último Acceso</th>
              <th className="px-6 py-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4 font-bold text-slate-900">{u.nombre}</td>
                <td className="px-6 py-4 text-slate-600 text-xs font-mono">{u.correo}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    u.rol === 'Dueña' ? 'bg-amber-100 text-amber-900' :
                    u.rol === 'Vendedor' ? 'bg-emerald-100 text-emerald-900' :
                    u.rol === 'Almacen' ? 'bg-sky-100 text-sky-900' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    u.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {u.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{u.ultimoAcceso}</td>
                <td className="px-6 py-4 text-right">
                  {u.rol !== 'Dueña' && (
                    <button
                      onClick={() => toggleEstado(u.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                        u.estado === 'ACTIVO'
                          ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.estado === 'ACTIVO' ? 'Bloquear Acceso' : 'Activar Usuario'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Registro de Auditoría (RF-32 / RNF-12) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Registro de Auditoría (Solo Inserción)</h3>
        <p className="text-xs text-slate-500">Trazabilidad inmutable de todas las ventas, modificaciones de precio y accesos.</p>

        <div className="divide-y divide-slate-100 text-xs">
          {auditoria.map((a, i) => (
            <div key={i} className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded mr-2">
                  {a.accion}
                </span>
                <span className="text-slate-600">Por: <strong>{a.usuario}</strong> en tabla <em>{a.entidad}</em></span>
              </div>
              <span className="text-slate-400 font-mono">{a.fecha}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
