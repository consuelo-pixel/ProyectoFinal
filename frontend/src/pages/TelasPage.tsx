import React, { useEffect, useState } from 'react';
import { listarTelas, registrarTela, cambiarEstadoTela } from '../services/telaService';
import { Tela, CrearTelaData } from '../types/tela';

export const TelasPage: React.FC = () => {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [buscar, setBuscar] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Formulario nueva tela
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Algodón');
  const [color, setColor] = useState('');
  const [ancho, setAncho] = useState(1.5);
  const [precioMetro, setPrecioMetro] = useState(35.0);
  const [stockMinimo, setStockMinimo] = useState(20.0);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await listarTelas(filtroEstado || undefined, buscar || undefined);
      setTelas(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtroEstado, buscar]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);

    const payload: CrearTelaData = {
      codigo,
      nombre,
      tipo,
      color,
      ancho: Number(ancho),
      precioMetro: Number(precioMetro),
      stockMinimo: Number(stockMinimo)
    };

    try {
      const nueva = await registrarTela(payload);
      setMensaje(`Tela '${nueva.nombre}' (${nueva.codigo}) registrada exitosamente.`);
      setMostrarModal(false);
      setCodigo('');
      setNombre('');
      setColor('');
      cargar();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMensajeError(err.message);
      } else {
        setMensajeError('Error al registrar la tela');
      }
    }
  };

  const handleToggleEstado = async (tela: Tela) => {
    const nuevoEstado = tela.estado === 'ACTIVA' ? 'DESHABILITADA' : 'ACTIVA';
    const ok = await cambiarEstadoTela(tela.idTela, nuevoEstado);
    if (ok) {
      setMensaje(`Tela '${tela.nombre}' cambiada a estado ${nuevoEstado} (RF-07: deshabilitar en vez de borrar).`);
      cargar();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner de Testing de RF-02 y RF-07 */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
            Módulos RF-02, RF-04, RF-05 y RF-07: Catálogo e Inventario
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Gestión y Control de Telas</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Prueba de registro de telas con precio/metro, alerta de stock mínimo y deshabilitación segura (borrado lógico sin pérdida de datos).
          </p>
        </div>
        <button
          onClick={() => { setMostrarModal(true); setMensajeError(null); }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          + Registrar Nueva Tela
        </button>
      </div>

      {mensaje && (
        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm font-medium flex justify-between items-center">
          <span>ℹ️ {mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-indigo-600 hover:text-indigo-900 font-bold">×</button>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-80 border rounded-lg px-3 py-2 text-sm bg-gray-50">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por código, nombre o tipo..."
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-auto">
          <span className="text-gray-500">Filtrar Estado:</span>
          <button
            onClick={() => setFiltroEstado('')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filtroEstado === '' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroEstado('ACTIVA')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filtroEstado === 'ACTIVA' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFiltroEstado('DESHABILITADA')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filtroEstado === 'DESHABILITADA' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Deshabilitadas
          </button>
        </div>
      </div>

      {/* Tabla de Telas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Código</th>
                <th className="px-6 py-3 text-left">Nombre de la Tela</th>
                <th className="px-6 py-3 text-left">Tipo / Color</th>
                <th className="px-6 py-3 text-left">Ancho</th>
                <th className="px-6 py-3 text-left">Precio/Metro</th>
                <th className="px-6 py-3 text-left">Metros Disp.</th>
                <th className="px-6 py-3 text-left">Stock Mínimo</th>
                <th className="px-6 py-3 text-left">Estado (RF-07)</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    Cargando catálogo de telas...
                  </td>
                </tr>
              ) : telas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron telas registradas.
                  </td>
                </tr>
              ) : (
                telas.map((t) => {
                  const bajoMinimo = t.metrosDisponibles < t.stockMinimo;
                  return (
                    <tr key={t.idTela} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-700">{t.codigo}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{t.nombre}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {t.tipo || 'General'} <span className="text-gray-400">•</span> {t.color || 'Varios'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{t.ancho ? `${t.ancho} m` : '—'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">Bs. {t.precioMetro.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${bajoMinimo ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {t.metrosDisponibles.toFixed(1)} m
                        </span>
                        {bajoMinimo && (
                          <span className="block text-[10px] text-amber-600 font-semibold uppercase">
                            ⚠️ Bajo Mínimo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{t.stockMinimo.toFixed(1)} m</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            t.estado === 'ACTIVA'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleEstado(t)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition border ${
                            t.estado === 'ACTIVA'
                              ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {t.estado === 'ACTIVA' ? 'Deshabilitar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Tela */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Registrar Nueva Tela (RF-02)</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            {mensajeError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                ⚠️ {mensajeError}
              </div>
            )}

            <form onSubmit={handleCrear} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Código *</label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. TEL-010"
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Tipo de Tela</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Algodón">Algodón</option>
                    <option value="Lino">Lino</option>
                    <option value="Seda">Seda</option>
                    <option value="Popelina">Popelina</option>
                    <option value="Jean/Denim">Jean/Denim</option>
                    <option value="Polar">Polar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 text-xs">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Lino Rústico Premium"
                  className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Verde Oliva"
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Ancho (metros)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={ancho}
                    onChange={(e) => setAncho(Number(e.target.value))}
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Precio por Metro (Bs.) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={precioMetro}
                    onChange={(e) => setPrecioMetro(Number(e.target.value))}
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 text-xs">Stock Mínimo (metros)</label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(Number(e.target.value))}
                    className="mt-1 w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition"
                >
                  Guardar Tela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
