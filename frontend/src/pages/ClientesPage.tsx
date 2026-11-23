import React, { useEffect, useState } from 'react';
import { listarClientes, registrarCliente } from '../services/clienteService';
import { Cliente, CrearClienteData } from '../types/cliente';

export const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Formulario nuevo cliente
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [limiteCredito, setLimiteCredito] = useState(1000);

  const cargar = async (termino?: string) => {
    setCargando(true);
    try {
      const data = await listarClientes(termino);
      setClientes(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar(buscar);
  }, [buscar]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    const payload: CrearClienteData = {
      nombre,
      carnet,
      nit: nit || undefined,
      telefono: telefono || undefined,
      direccion: direccion || undefined,
      limiteCredito: Number(limiteCredito)
    };

    try {
      const nuevo = await registrarCliente(payload);
      setMensajeExito(`Cliente '${nuevo.nombre}' registrado con éxito.`);
      setMostrarModal(false);
      setNombre('');
      setCarnet('');
      setNit('');
      setTelefono('');
      setDireccion('');
      cargar(buscar);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMensajeError(err.message);
      } else {
        setMensajeError('No se pudo registrar el cliente');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Directorio de Clientes</h2>
          <p className="text-sm text-slate-500">Registro de compradores frecuentes y control de crédito para ventas al fiado.</p>
        </div>
        <button
          onClick={() => { setMostrarModal(true); setMensajeError(null); }}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition text-sm"
        >
          + Registrar Nuevo Cliente
        </button>
      </div>

      {mensajeExito && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex justify-between items-center">
          <span>✓ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <span className="text-slate-400 pl-1">🔍</span>
        <input
          type="text"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar cliente por nombre, carnet de identidad o NIT..."
          className="w-full text-sm outline-none bg-transparent"
        />
        {buscar && (
          <button onClick={() => setBuscar('')} className="text-xs text-slate-400 hover:text-slate-600 px-2">
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Código</th>
                <th className="px-6 py-3.5 text-left">Nombre Completo</th>
                <th className="px-6 py-3.5 text-left">Carnet (CI)</th>
                <th className="px-6 py-3.5 text-left">NIT</th>
                <th className="px-6 py-3.5 text-left">Teléfono</th>
                <th className="px-6 py-3.5 text-left">Límite de Crédito</th>
                <th className="px-6 py-3.5 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Cargando listado de clientes...
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No se encontraron clientes con el criterio "{buscar}".
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.idCliente} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">#{c.idCliente}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{c.nombre}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">{c.carnet}</td>
                    <td className="px-6 py-4 text-slate-500">{c.nit || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{c.telefono || '—'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">Bs. {c.limiteCredito.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Cliente */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Registrar Cliente</h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {mensajeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {mensajeError}
              </div>
            )}

            <form onSubmit={handleCrear} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Carmen Mendoza López"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Carnet (CI) *</label>
                  <input
                    type="text"
                    required
                    value={carnet}
                    onChange={(e) => setCarnet(e.target.value)}
                    placeholder="Ej. 5839201"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">NIT (Opcional)</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="Ej. 5839201019"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 72984012"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Límite de Crédito (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={limiteCredito}
                    onChange={(e) => setLimiteCredito(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Dirección / Taller</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Barrio Senac, Calle Los Lapachos #120"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
