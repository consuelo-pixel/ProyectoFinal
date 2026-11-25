import React, { useEffect, useState } from 'react';
import {
  ResumenCaja,
  CierreCajaHistorial,
  obtenerResumenCajaHoy,
  realizarCierreCaja,
  listarHistorialCierres
} from '../services/cajaService';

export const CajaPage: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenCaja | null>(null);
  const [historial, setHistorial] = useState<CierreCajaHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [res, hist] = await Promise.all([
        obtenerResumenCajaHoy(),
        listarHistorialCierres()
      ]);
      setResumen(res);
      setHistorial(hist);
    } catch (err: any) {
      setError(err.message || 'Error al cargar información de caja');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCierreCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumen) return;

    if (!window.confirm('¿Confirmas que deseas realizar el cierre definitivo de caja para el día de hoy? Esta acción cuadra los cobros de la jornada.')) {
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      await realizarCierreCaja({
        observacion: observacion.trim() || undefined
      });
      setMensajeExito('¡Cierre de caja registrado exitosamente!');
      setObservacion('');
      await cargarDatos();
    } catch (err: any) {
      setError(err.message || 'Error al procesar el cierre de caja.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Módulo de Tesorería • RF-28
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Cierre de Caja Diario</h1>
          <p className="text-sm text-slate-500">
            Control de ingresos del día clasificados por método de pago (Efectivo, QR y Transferencia) y arqueo general.
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="self-start sm:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          🔄 Actualizar Caja
        </button>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm">
          <span>✅ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Tarjetas de Resumen de Hoy */}
      {resumen && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              📅 Resumen de la Jornada
              <span className="text-xs font-medium text-slate-500">({resumen.fecha})</span>
            </h2>
            {resumen.yaCerrado ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-black flex items-center gap-1">
                🔒 Caja Cerrada para Hoy
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-black flex items-center gap-1">
                🟢 Caja Abierta en Turno
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Efectivo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Efectivo en Caja</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">💵</span>
              </div>
              <p className="text-2xl font-black text-slate-900">Bs. {resumen.totalEfectivo.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Cobros en mostrador físico</p>
            </div>

            {/* QR Simple */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Pagos por QR</span>
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">📱</span>
              </div>
              <p className="text-2xl font-black text-slate-900">Bs. {resumen.totalQr.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Transferencias QR verificadas</p>
            </div>

            {/* Transferencias */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Transferencias Bancarias</span>
                <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">🏦</span>
              </div>
              <p className="text-2xl font-black text-slate-900">Bs. {resumen.totalTransferencia.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Depósitos y cuentas bancarias</p>
            </div>

            {/* Total General */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-700">
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total General Cobrado</span>
                <span className="p-2 bg-white/10 rounded-xl">💰</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">Bs. {resumen.totalGeneral.toFixed(2)}</p>
              <p className="text-xs text-slate-300 mt-1">{resumen.cantidadVentas} operaciones registradas</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Cierre de Caja */}
      {resumen && !resumen.yaCerrado && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Efectuar Cierre de Caja del Día</h3>
            <p className="text-xs text-slate-500 mb-4">
              Al confirmar, se guardará el arqueo con los totales acumulados. Se aconseja realizarlo al final de la jornada laboral.
            </p>

            <form onSubmit={handleCierreCaja} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Observaciones o Novedades de Caja (Opcional)
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ej. Billetes de 100 y 50 apartados para cambio de mañana. Todo conforme."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {guardando ? 'Guardando Cierre...' : '🔒 Confirmar y Cerrar Caja de Hoy'}
              </button>
            </form>
          </div>
        </div>
      )}

      {resumen?.yaCerrado && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
          <h4 className="font-bold text-sm flex items-center gap-2">
            🔒 El arqueo de hoy se encuentra concluido
          </h4>
          <p className="text-xs mt-1 text-amber-800">
            Observación registrada: <span className="font-semibold">{resumen.observacionCierre || 'Sin novedades particulares.'}</span>
          </p>
        </div>
      )}

      {/* Historial de Cierres Anteriores */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-base">Historial de Cierres de Caja</h3>
          <p className="text-xs text-slate-500">Registro histórico de cierres diarios para auditoría y contabilidad.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Efectivo</th>
                <th className="px-5 py-3">QR Simple</th>
                <th className="px-5 py-3">Transferencia</th>
                <th className="px-5 py-3 font-extrabold text-slate-900">Total Cuadrado</th>
                <th className="px-5 py-3">Responsable</th>
                <th className="px-5 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historial.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No hay cierres anteriores registrados en el sistema.
                  </td>
                </tr>
              ) : (
                historial.map((c) => (
                  <tr key={c.idCierre} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{c.fecha}</td>
                    <td className="px-5 py-3.5">Bs. {c.totalEfectivo.toFixed(2)}</td>
                    <td className="px-5 py-3.5">Bs. {c.totalQr.toFixed(2)}</td>
                    <td className="px-5 py-3.5">Bs. {c.totalTransferencia.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-extrabold text-emerald-700">Bs. {c.totalGeneral.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium text-xs">
                        {c.usuario}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate" title={c.observacion}>
                      {c.observacion || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
