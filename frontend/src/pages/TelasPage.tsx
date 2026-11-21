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
      setMensaje(`Tela '${nueva.nombre}' (${nueva.codigo}) ingresada al inventario correctamente.`);
      setMostrarModal(false);
      setCodigo('');
      setNombre('');
      setColor('');
      cargar();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMensajeError(err.message);
      } else {
        setMensajeError('Error al guardar tela');
      }
    }
  };

  const handleToggleEstado = async (tela: Tela) => {
    const nuevoEstado = tela.estado === 'ACTIVA' ? 'DESHABILITADA' : 'ACTIVA';
    const ok = await cambiarEstadoTela(tela.idTela, nuevoEstado);
    if (ok) {
      setMensaje(`La tela '${tela.nombre}' ahora figura como ${nuevoEstado}.`);
      cargar();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventario de Telas</h2>
          <p className="text-sm text-slate-500">Control de existencias de rollos, precios por metro y alertas de reposición.</p>
        </div>
        <button
          onClick={() => { setMostrarModal(true); setMensajeError(null); }}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition text-sm"
        >
          + Agregar Nueva Tela
        </button>
      </div>

      {mensaje && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex justify-between items-center">
          <span>✓ {mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-80 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por código, nombre o tipo de tela..."
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold self-end sm:self-auto">
          <span className="text-slate-400 uppercase text-[11px]">Estado:</span>
          <button
            onClick={() => setFiltroEstado('')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filtroEstado === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroEstado('ACTIVA')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filtroEstado === 'ACTIVA' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFiltroEstado('DESHABILITADA')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filtroEstado === 'DESHABILITADA' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Deshabilitadas
          </button>
        </div>
      </div>

      {/* Tabla de Telas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Código</th>
                <th className="px-6 py-3.5 text-left">Tela</th>
                <th className="px-6 py-3.5 text-left">Tipo / Color</th>
                <th className="px-6 py-3.5 text-left">Ancho</th>
                <th className="px-6 py-3.5 text-left">Precio/Metro</th>
                <th className="px-6 py-3.5 text-left">Metros Disponibles</th>
                <th className="px-6 py-3.5 text-left">Stock Mínimo</th>
                <th className="px-6 py-3.5 text-left">Estado</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cargando ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-slate-400">
                    Cargando existencias de tela...
                  </td>
                </tr>
              ) : telas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                    No se encontraron telas en el inventario.
                  </td>
                </tr>
              ) : (
                telas.map((t) => {
                  const bajoMinimo = t.metrosDisponibles < t.stockMinimo;
                  return (
                    <tr key={t.idTela} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700">{t.codigo}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{t.nombre}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {t.tipo || 'General'} • {t.color || 'Varios'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{t.ancho ? `${t.ancho} m` : '—'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">Bs. {t.precioMetro.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-black ${bajoMinimo ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {t.metrosDisponibles.toFixed(1)} m
                        </span>
                        {bajoMinimo && (
                          <span className="block text-[10px] text-amber-700 font-bold uppercase mt-0.5">
                            Reponer Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{t.stockMinimo.toFixed(1)} m</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            t.estado === 'ACTIVA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleEstado(t)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                            t.estado === 'ACTIVA'
                              ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Registrar Tela en Almacén</h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {mensajeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {mensajeError}
              </div>
            )}

            <form onSubmit={handleCrear} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Código de Tela *</label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. TEL-105"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Tipo de Tejido</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Algodón">Algodón</option>
                    <option value="Lino">Lino</option>
                    <option value="Seda">Seda</option>
                    <option value="Popelina">Popelina</option>
                    <option value="Denim / Jean">Denim / Jean</option>
                    <option value="Polar">Polar</option>
                    <option value="Tropical Mecánico">Tropical Mecánico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Nombre Comercial de la Tela *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Lino Suizo Estampado"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Color / Tono</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Terracota"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Ancho (metros)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={ancho}
                    onChange={(e) => setAncho(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Precio por Metro (Bs.) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={precioMetro}
                    onChange={(e) => setPrecioMetro(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Stock Mínimo (metros)</label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
