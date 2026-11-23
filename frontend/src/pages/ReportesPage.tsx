import React, { useEffect, useState } from 'react';
import {
  ResumenVentasPeriodo,
  RotacionTela,
  obtenerReporteVentas,
  obtenerReporteRotacion
} from '../services/reporteService';

export const ReportesPage: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenVentasPeriodo | null>(null);
  const [rotacion, setRotacion] = useState<RotacionTela[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pestaña, setPestaña] = useState<'ventas' | 'rotacion'>('ventas');

  const cargar = async () => {
    setCargando(true);
    try {
      const [v, r] = await Promise.all([
        obtenerReporteVentas(),
        obtenerReporteRotacion()
      ]);
      setResumen(v);
      setRotacion(r);
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Inteligencia de Negocio • RF-25, RF-26, RF-27
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Reportes Comerciales y Rotación</h1>
          <p className="text-sm text-slate-500">
            Análisis de ventas mensuales, desglose de ingresos y rotación de telas para decisiones de compra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            🖨️ Exportar a PDF (A4)
          </button>
          <button
            onClick={cargar}
            disabled={cargando}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            title="Recargar métricas"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Selector de pestañas */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setPestaña('ventas')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            pestaña === 'ventas' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📈 Resumen de Ventas y Finanzas (RF-25)
        </button>
        <button
          onClick={() => setPestaña('rotacion')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            pestaña === 'rotacion' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🔄 Rotación y Demanda de Telas (RF-26)
        </button>
      </div>

      {pestaña === 'ventas' && resumen && (
        <div className="space-y-6">
          {/* Tarjetas Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Totales Brutas</span>
              <p className="text-3xl font-black text-slate-900 mt-2">Bs. {resumen.totalVentasMonto.toFixed(2)}</p>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                {resumen.cantidadNotasEmitidas} notas de venta emitidas
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metros Despachados</span>
              <p className="text-3xl font-black text-emerald-700 mt-2">{resumen.totalMetrosVendidos.toFixed(1)} m</p>
              <p className="text-xs text-slate-500 mt-1">Cortes por metro y rollo completo</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className="text-3xl font-black text-slate-900 mt-2">Bs. {resumen.ticketPromedio.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Promedio facturado por compra</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crédito Emitido (Fiado)</span>
              <p className="text-3xl font-black text-rose-600 mt-2">Bs. {resumen.totalCreditoEmitido.toFixed(2)}</p>
              <p className="text-xs text-rose-700 font-semibold mt-1">Por liquidar en cobranzas</p>
            </div>
          </div>

          {/* Desglose por Método de Pago */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900">
              Desglose de Ingresos por Canal de Cobro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-800">💵 Efectivo en Caja</span>
                  <p className="text-xl font-black text-emerald-900 mt-1">Bs. {resumen.totalEfectivo.toFixed(2)}</p>
                </div>
                <span className="text-2xl">💰</span>
              </div>

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-teal-800">📱 QR Simple</span>
                  <p className="text-xl font-black text-teal-900 mt-1">Bs. {resumen.totalQr.toFixed(2)}</p>
                </div>
                <span className="text-2xl">📲</span>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-sky-800">🏦 Transferencia Bancaria</span>
                  <p className="text-xl font-black text-sky-900 mt-1">Bs. {resumen.totalTransferencia.toFixed(2)}</p>
                </div>
                <span className="text-2xl">💳</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {pestaña === 'rotacion' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Matriz de Rotación de Inventario</h3>
              <p className="text-xs text-slate-500">
                Clasificación de telas según volumen de venta mensual para optimizar compras a proveedores.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Código / Tela</th>
                  <th className="px-6 py-3.5">Color</th>
                  <th className="px-6 py-3.5">Metros Vendidos</th>
                  <th className="px-6 py-3.5">Total Generado</th>
                  <th className="px-6 py-3.5">Stock en Rollo</th>
                  <th className="px-6 py-3.5">Nivel de Rotación</th>
                  <th className="px-6 py-3.5">Sugerencia Estratégica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rotacion.map((r) => (
                  <tr key={r.idTela} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{r.nombre}</div>
                      <div className="text-[11px] font-mono text-slate-400">{r.codigo}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{r.color}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{r.metrosVendidos.toFixed(1)} m</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">Bs. {r.montoGenerado.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{r.metrosDisponibles.toFixed(1)} m</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        r.nivelRotacion === 'ALTA'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : r.nivelRotacion === 'MEDIA'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {r.nivelRotacion === 'ALTA' ? '⭐ Alta Salida' :
                         r.nivelRotacion === 'MEDIA' ? '✓ Estable' : '⚠️ Lenta / Estancada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-sm">
                      {r.sugerenciaComercial}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
