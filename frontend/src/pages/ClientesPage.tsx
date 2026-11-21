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
      setMensajeExito(`Cliente '${nuevo.nombre}' registrado con éxito con Carnet ${nuevo.carnet}.`);
      setMostrarModal(false);
      // Limpiar formulario
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
        setMensajeError('Error al registrar cliente');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner de Testing de RF-01 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
            Módulo RF-01: Gestión de Clientes
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Directorio y Crédito de Clientes</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Prueba de búsqueda rápida (&lt; 2 s / RNF-01), registro con validaciones de carnet único y asignación de límite de crédito.
          </p>
        </div>
        <button
          onClick={() => { setMostrarModal(true); setMensajeError(null); }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition"
        >
          + Registrar Nuevo Cliente
        </button>
      </div>

      {mensajeExito && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium flex justify-between items-center">
          <span>✅ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-green-600 hover:text-green-900">×</button>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar cliente por nombre, carnet o NIT (ej. 'María', '5849302', 'Benítez')..."
          className="w-full text-sm outline-none bg-transparent"
        />
        {buscar && (
          <button onClick={() => setBuscar('')} className="text-xs text-gray-400 hover:text-gray-600">
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Nombre del Cliente</th>
                <th className="px-6 py-3 text-left">Carnet</th>
                <th className="px-6 py-3 text-left">NIT</th>
                <th className="px-6 py-3 text-left">Teléfono</th>
                <th className="px-6 py-3 text-left">Límite Crédito</th>
                <th className="px-6 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron clientes con el criterio "{buscar}".
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.idCliente} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{c.idCliente}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{c.nombre}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{c.carnet}</td>
                    <td className="px-6 py-4 text-gray-500">{c.nit || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{c.telefono || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">Bs. {c.limiteCredito.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Cliente (RF-01)</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            {mensajeError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                ⚠️ {mensajeError}
              </div>
            )}

            <form onSubmit={handleCrear} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 text-xs">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Roberto Quispe Flores"
                  className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Carnet de Identidad (CI) *</label>
                  <input
                    type="text"
                    required
                    value={carnet}
                    onChange={(e) => setCarnet(e.target.value)}
                    placeholder="Ej. 6830291"
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 text-xs">NIT (Opcional)</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="Ej. 6830291014"
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 75148092"
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Límite de Crédito (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={limiteCredito}
                    onChange={(e) => setLimiteCredito(Number(e.target.value))}
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 text-xs">Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. B/ Central, Calle Bolívar #250"
                  className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition"
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
