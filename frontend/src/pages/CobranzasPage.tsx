import React, { useEffect, useState } from 'react';
import {
  CuentaPorCobrar,
  ComprobanteAbono,
  obtenerCuentasPendientes,
  registrarAbono
} from '../services/cobranzaService';

export const CobranzasPage: React.FC = () => {
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de Abono
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaPorCobrar | null>(null);
  const [montoAbono, setMontoAbono] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('EFECTIVO');
  const [procesandoAbono, setProcesandoAbono] = useState(false);

  // Modal de Comprobante Emitido
  const [comprobanteEmitido, setComprobanteEmitido] = useState<ComprobanteAbono | null>(null);

  const cargarCuentas = async (query?: string) => {
    setCargando(true);
    try {
      const data = await obtenerCuentasPendientes(query);
      setCuentas(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la lista de cuentas pendientes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarCuentas(busqueda);
  };

  const abrirModalAbono = (cuenta: CuentaPorCobrar) => {
    setCuentaSeleccionada(cuenta);
    setMontoAbono(cuenta.saldoPendiente.toString());
    setMetodoPago('EFECTIVO');
    setError(null);
  };

  const handleRegistrarAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuentaSeleccionada) return;

    const monto = parseFloat(montoAbono);
    if (isNaN(monto) || monto <= 0) {
      alert('Ingresa un monto válido mayor a 0 Bs.');
      return;
    }

    if (monto > cuentaSeleccionada.saldoPendiente) {
      alert(`El abono no puede superar el saldo pendiente de Bs. ${cuentaSeleccionada.saldoPendiente.toFixed(2)}`);
      return;
    }

    setProcesandoAbono(true);
    try {
      const comprobante = await registrarAbono({
        idVenta: cuentaSeleccionada.idVenta,
        monto,
        metodoPago
      });

      setComprobanteEmitido(comprobante);
      setCuentaSeleccionada(null);
      await cargarCuentas(busqueda);
    } catch (err: any) {
      alert(err.message || 'Error al registrar el abono.');
    } finally {
      setProcesandoAbono(false);
    }
  };

  const totalPorCobrar = cuentas.reduce((acc, curr) => acc + curr.saldoPendiente, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Crédito y Cobranzas • RF-14, RF-15, RF-16
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Cuentas por Cobrar y Abonos</h1>
          <p className="text-sm text-slate-500">
            Seguimiento de ventas al fiado, registro de pagos parciales y emisión de comprobantes oficiales.
          </p>
        </div>

        {/* Tarjeta de Saldo Total Pendiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3 rounded-2xl shadow-sm text-right">
          <p className="text-xs font-medium uppercase tracking-wider opacity-90">Saldo Total en la Calle</p>
          <p className="text-2xl font-black">Bs. {totalPorCobrar.toFixed(2)}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre del cliente o carnet de identidad..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
          >
            🔍 Buscar
          </button>
          {busqueda && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                cargarCuentas('');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Tabla de Cuentas por Cobrar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Clientes con Saldo Pendiente</h3>
            <p className="text-xs text-slate-500">{cuentas.length} cuenta(s) activa(s) con saldo por liquidar</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Nro. Venta</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Carnet / Teléfono</th>
                <th className="px-5 py-3">Fecha Venta</th>
                <th className="px-5 py-3">Total Venta</th>
                <th className="px-5 py-3 font-extrabold text-rose-700">Saldo Pendiente</th>
                <th className="px-5 py-3">Vencimiento</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cargando ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Cargando cuentas por cobrar...
                  </td>
                </tr>
              ) : cuentas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    🎉 No hay cuentas pendientes por cobrar en este momento.
                  </td>
                </tr>
              ) : (
                cuentas.map((c) => (
                  <tr key={c.idVenta} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">#{c.idVenta}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{c.nombreCliente}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <div>{c.carnetCliente}</div>
                      {c.telefonoCliente && <div className="text-emerald-700">📞 {c.telefonoCliente}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-xs">{new Date(c.fechaVenta).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">Bs. {c.totalVenta.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-black text-rose-600 text-base">
                      Bs. {c.saldoPendiente.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {c.fechaVencimiento ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                          {c.fechaVencimiento}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin límite</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => abrirModalAbono(c)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                      >
                        💵 Registrar Abono
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registrar Abono */}
      {cuentaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Cobranza de Venta #{cuentaSeleccionada.idVenta}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Registrar Abono</h3>
              </div>
              <button
                onClick={() => setCuentaSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs text-slate-700">
              <p><span className="font-bold">Cliente:</span> {cuentaSeleccionada.nombreCliente}</p>
              <p><span className="font-bold">Carnet:</span> {cuentaSeleccionada.carnetCliente}</p>
              <p><span className="font-bold">Saldo actual adeudado:</span> <span className="font-extrabold text-rose-600 text-sm">Bs. {cuentaSeleccionada.saldoPendiente.toFixed(2)}</span></p>
            </div>

            <form onSubmit={handleRegistrarAbono} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Monto a Abonar (Bs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Bs.</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0.50"
                    max={cuentaSeleccionada.saldoPendiente}
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setMontoAbono((cuentaSeleccionada.saldoPendiente / 2).toFixed(2))}
                    className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    50% (Bs. {(cuentaSeleccionada.saldoPendiente / 2).toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMontoAbono(cuentaSeleccionada.saldoPendiente.toString())}
                    className="text-[11px] px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg"
                  >
                    Liquidar Total (Bs. {cuentaSeleccionada.saldoPendiente.toFixed(2)})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="EFECTIVO">💵 Efectivo en Caja</option>
                  <option value="QR">📱 QR Simple</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCuentaSeleccionada(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAbono}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {procesandoAbono ? 'Guardando...' : 'Confirmar Abono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comprobante de Abono Emitido (RF-16) */}
      {comprobanteEmitido && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera del Comprobante */}
            <div className="text-center border-b border-slate-200 pb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700">Telas Juanita • Tarija</span>
              <h3 className="text-2xl font-black text-slate-900">Comprobante de Abono</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">{comprobanteEmitido.nroComprobante}</p>
            </div>

            {/* Detalles */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fecha y Hora:</span>
                <span className="font-semibold">{new Date(comprobanteEmitido.fecha).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-900">{comprobanteEmitido.cliente}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Carnet / Documento:</span>
                <span className="font-semibold">{comprobanteEmitido.carnet}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-semibold uppercase">{comprobanteEmitido.metodoPago}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cobrado por:</span>
                <span className="font-semibold">{comprobanteEmitido.cobradoPor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Saldo Anterior:</span>
                <span>Bs. {comprobanteEmitido.saldoAnterior.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-emerald-500 text-base font-extrabold text-emerald-700">
                <span>Monto Abonado:</span>
                <span>Bs. {comprobanteEmitido.montoAbonado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold">
                <span className="text-slate-700">Nuevo Saldo Pendiente:</span>
                <span className={comprobanteEmitido.saldoRestante === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {comprobanteEmitido.saldoRestante === 0 ? '¡DEUDA TOTALMENTE SALDADA! (Bs. 0.00)' : `Bs. ${comprobanteEmitido.saldoRestante.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                🖨️ Imprimir Comprobante
              </button>
              <button
                onClick={() => setComprobanteEmitido(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
