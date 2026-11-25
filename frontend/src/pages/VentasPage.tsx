import React, { useState, useEffect } from 'react';
import { listarTelas } from '../services/telaService';
import { listarClientes } from '../services/clienteService';
import {
  NotaVenta,
  registrarVenta,
  listarVentasRecientes,
  anularVenta
} from '../services/ventaService';
import { Tela } from '../types/tela';
import { Cliente } from '../types/cliente';
import { useAuth } from '../context/AuthContext';

interface LineaVenta {
  tela: Tela;
  metros: number;
  precioMetro: number;
  subtotal: number;
}

export const VentasPage: React.FC = () => {
  const { usuario } = useAuth();
  const [pestaña, setPestaña] = useState<'nueva' | 'historial'>('nueva');

  // Datos de apoyo
  const [telas, setTelas] = useState<Tela[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventasRecientes, setVentasRecientes] = useState<NotaVenta[]>([]);

  // Selección de cliente
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);

  // Línea actual
  const [telaId, setTelaId] = useState<number>(0);
  const [metros, setMetros] = useState<number>(2.5);

  // Carrito de la venta
  const [lineas, setLineas] = useState<LineaVenta[]>([]);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'QR' | 'TRANSFERENCIA' | 'CREDITO'>('EFECTIVO');
  const [plazoDias, setPlazoDias] = useState<number>(30);
  const [guardando, setGuardando] = useState(false);

  // Nota de venta generada o vista en modal
  const [notaventa, setNotaVenta] = useState<NotaVenta | null>(null);

  // Modal de anulación (RF-13, RN-04)
  const [ventaAAnular, setVentaAAnular] = useState<NotaVenta | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

  const cargarDatos = async () => {
    try {
      const [telasData, clientesData, ventasData] = await Promise.all([
        listarTelas('ACTIVA'),
        listarClientes(),
        listarVentasRecientes()
      ]);
      setTelas(telasData);
      if (telasData.length > 0 && telaId === 0) {
        setTelaId(telasData[0].idTela);
      }
      setClientes(clientesData);
      setVentasRecientes(ventasData);
    } catch (err: any) {
      console.error('Error al cargar datos de ventas:', err);
      alert(err.message || 'No se pudieron cargar los datos de ventas.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const agregarLinea = () => {
    const t = telas.find((x) => x.idTela === telaId);
    if (!t) return;
    if (metros <= 0) {
      alert('Ingresa una cantidad de metros mayor a 0');
      return;
    }

    if (metros > t.metrosDisponibles) {
      alert(`Existencias insuficientes. Metros disponibles en almacén: ${t.metrosDisponibles} m.`);
      return;
    }

    const sub = Number((t.precioMetro * metros).toFixed(2));
    setLineas([...lineas, { tela: t, metros, precioMetro: t.precioMetro, subtotal: sub }]);
  };

  const eliminarLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  // Cálculos totales y descuento por mayor (RF-09: >= 20 metros totales aplica 10%)
  const subtotalGeneral = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const metrosTotales = lineas.reduce((acc, l) => acc + l.metros, 0);
  const aplicaDescuentoMayor = metrosTotales >= 20;
  const descuento = aplicaDescuentoMayor ? Number((subtotalGeneral * 0.10).toFixed(2)) : 0;
  const totalPagar = Number((subtotalGeneral - descuento).toFixed(2));

  const handleFinalizarVenta = async () => {
    if (lineas.length === 0) {
      alert('Agrega al menos una tela a la venta');
      return;
    }

    if (metodoPago === 'CREDITO' && !clienteSeleccionado) {
      alert('Para ventas a crédito (fiado) es obligatorio seleccionar un cliente registrado (RF-10).');
      return;
    }

    setGuardando(true);
    try {
      const notaCreada = await registrarVenta({
        idCliente: clienteSeleccionado || undefined,
        lineas: lineas.map((l) => ({
          idTela: l.tela.idTela,
          cantidadMetros: l.metros
        })),
        metodoPago,
        plazoDiasCredito: metodoPago === 'CREDITO' ? plazoDias : undefined
      });

      setNotaVenta(notaCreada);
      setLineas([]);
      setClienteSeleccionado(null);
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al emitir la nota de venta');
    } finally {
      setGuardando(false);
    }
  };

  const handleAnularVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventaAAnular) return;

    if (!motivoAnulacion.trim()) {
      alert('El motivo de anulación es estrictamente obligatorio (RN-04).');
      return;
    }

    setProcesandoAnulacion(true);
    try {
      await anularVenta(ventaAAnular.idVenta, motivoAnulacion.trim(), usuario?.rol || 'Dueña');
      alert('Nota de venta anulada con éxito y metros restituidos al almacén.');
      setVentaAAnular(null);
      setMotivoAnulacion('');
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al anular la venta.');
    } finally {
      setProcesandoAnulacion(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            Módulo de Ventas • RF-08, RF-09, RF-10, RF-11, RF-13
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Mostrador de Ventas y Facturación</h2>
          <p className="text-sm text-slate-500">Corte por metro o rollo cerrado con cálculo automático de descuento por mayor (10% en $\ge$ 20 m).</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-slate-100 p-1 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setPestaña('nueva')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              pestaña === 'nueva' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛒 Nueva Venta
          </button>
          <button
            onClick={() => setPestaña('historial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              pestaña === 'historial' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Notas Emitidas ({ventasRecientes.length})
          </button>
        </div>
      </div>

      {pestaña === 'nueva' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Izquierdo: Selección de cliente y tela */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selección de Cliente */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">1. Cliente</h3>
                <span className="text-xs text-slate-400">Opcional para contado, obligatorio para crédito</span>
              </div>

              <select
                value={clienteSeleccionado ?? ''}
                onChange={(e) => setClienteSeleccionado(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="">Cliente Ocasional / Venta de Mostrador</option>
                {clientes.map((c) => (
                  <option key={c.idCliente} value={c.idCliente}>
                    {c.nombre} • CI/NIT: {c.carnet} {c.limiteCredito ? `(Límite: Bs. ${c.limiteCredito})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Telas y Metraje */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">2. Añadir Corte de Tela al Carrito</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Seleccionar Tela
                  </label>
                  <select
                    value={telaId}
                    onChange={(e) => setTelaId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    {telas.map((t) => (
                      <option key={t.idTela} value={t.idTela}>
                        {t.nombre} ({t.color}) - Bs. {t.precioMetro.toFixed(2)}/m [Disp: {t.metrosDisponibles} m]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Metros Requeridos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={metros}
                      onChange={(e) => setMetros(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={agregarLinea}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Artículos Agregados */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-800">Cortes Agregados a la Nota</h4>
                <span className="text-xs font-bold text-emerald-700">{lineas.length} artículo(s)</span>
              </div>

              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-5 py-3">Tela</th>
                    <th className="px-5 py-3">Precio/m</th>
                    <th className="px-5 py-3">Metros</th>
                    <th className="px-5 py-3">Subtotal</th>
                    <th className="px-5 py-3 text-right">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        El carrito está vacío. Agrega telas arriba.
                      </td>
                    </tr>
                  ) : (
                    lineas.map((l, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 font-semibold text-slate-800">
                          {l.tela.nombre} <span className="text-xs text-slate-400">({l.tela.color})</span>
                        </td>
                        <td className="px-5 py-3">Bs. {l.precioMetro.toFixed(2)}</td>
                        <td className="px-5 py-3 font-extrabold text-slate-900">{l.metros} m</td>
                        <td className="px-5 py-3 font-bold text-emerald-700">Bs. {l.subtotal.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => eliminarLinea(idx)}
                            className="text-rose-600 hover:text-rose-800 font-black text-sm px-2 py-1"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel Derecho: Liquidación, Método de Pago y Emisión */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                3. Forma de Pago & Cobro
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['EFECTIVO', 'QR', 'TRANSFERENCIA', 'CREDITO'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetodoPago(m)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        metodoPago === m
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'EFECTIVO' ? '💵 Efectivo' :
                       m === 'QR' ? '📱 QR Simple' :
                       m === 'TRANSFERENCIA' ? '🏦 Transf.' : '📜 Fiado / Crédito'}
                    </button>
                  ))}
                </div>
              </div>

              {metodoPago === 'CREDITO' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs text-amber-900">
                  <label className="block font-bold">Plazo de Vencimiento:</label>
                  <select
                    value={plazoDias}
                    onChange={(e) => setPlazoDias(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold"
                  >
                    <option value={15}>15 Días calendario</option>
                    <option value={30}>30 Días calendario (1 mes)</option>
                    <option value={60}>60 Días calendario (2 meses)</option>
                  </select>
                </div>
              )}

              {/* Resumen numérico */}
              <div className="space-y-2.5 text-xs sm:text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Metros Acumulados:</span>
                  <span className="font-bold text-slate-900">{metrosTotales.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Bruto:</span>
                  <span className="font-bold text-slate-900">Bs. {subtotalGeneral.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                  <span>Descuento por Mayor {aplicaDescuentoMayor ? '(10%)' : ''}:</span>
                  <span className="font-black">{aplicaDescuentoMayor ? `- Bs. ${descuento.toFixed(2)}` : 'Bs. 0.00'}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-base font-black text-slate-900">Total a Cobrar:</span>
                  <span className="text-2xl font-black text-emerald-700">Bs. {totalPagar.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinalizarVenta}
                disabled={lineas.length === 0 || guardando}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg transition"
              >
                {guardando ? 'Generando Nota...' : 'Confirmar Venta y Emitir Nota'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Pestaña: Historial de Ventas y Anulaciones */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Registro de Notas de Venta</h3>
              <p className="text-xs text-slate-500">Historial de ventas emitidas, estado contable y control de anulación.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nro. Nota</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Vendedora</th>
                  <th className="px-5 py-3">Metraje</th>
                  <th className="px-5 py-3">Método</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ventasRecientes.map((v) => (
                  <tr key={v.idVenta} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{v.numeroNota}</td>
                    <td className="px-5 py-3.5 text-xs">{new Date(v.fecha).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 font-medium">{v.cliente}</td>
                    <td className="px-5 py-3.5 text-xs">{v.vendedor}</td>
                    <td className="px-5 py-3.5 font-bold">{v.metrosTotales} m</td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className={`px-2 py-0.5 rounded font-semibold ${
                        v.esCredito ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.metodoPago}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-black text-emerald-700">Bs. {v.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      {v.estado === 'ANULADA' ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-black text-xs">
                          ⛔ ANULADA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-xs">
                          REGISTRADA
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setNotaVenta(v)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                      >
                        Ver Nota
                      </button>

                      {v.estado !== 'ANULADA' && (
                        usuario?.rol === 'Dueña' ? (
                          <button
                            onClick={() => {
                              setVentaAAnular(v);
                              setMotivoAnulacion('');
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs border border-rose-200"
                          >
                            Anular
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Solo Dueña anula</span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Impresión / Visualización de Nota de Venta (RF-11) */}
      {notaventa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Telas Juanita • Tarija</span>
                <h3 className="text-2xl font-black text-slate-900">{notaventa.numeroNota}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(notaventa.fecha).toLocaleString()}</p>
              </div>
              <button onClick={() => setNotaVenta(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p><strong>Cliente:</strong> {notaventa.cliente} {notaventa.carnet !== '—' && `(CI: ${notaventa.carnet})`}</p>
              <p><strong>Atendido por:</strong> {notaventa.vendedor}</p>
              <p><strong>Forma de Pago:</strong> {notaventa.metodoPago} {notaventa.esCredito && notaventa.fechaVencimiento && `(Vence: ${notaventa.fechaVencimiento})`}</p>
            </div>

            {/* Lista de productos */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase">Detalle de Telas Cortadas:</p>
              <div className="divide-y divide-slate-100 text-xs">
                {notaventa.detalles.map((it, i) => (
                  <div key={i} className="py-2 flex justify-between">
                    <span>{it.cantidadMetros} m de {it.nombreTela} (Bs. {it.precioUnitario.toFixed(2)}/m)</span>
                    <span className="font-bold text-slate-900">Bs. {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-right">
              <p className="text-slate-500">Subtotal: <strong className="text-slate-800">Bs. {notaventa.subtotal.toFixed(2)}</strong></p>
              {notaventa.descuento > 0 && (
                <p className="text-emerald-700 font-bold">Descuento por mayor (10%): - Bs. {notaventa.descuento.toFixed(2)}</p>
              )}
              <p className="text-xl font-black text-slate-900 pt-1">
                Total a Cancelar: <span className="text-emerald-700">Bs. {notaventa.total.toFixed(2)}</span>
              </p>
              {notaventa.esCredito && (
                <p className="text-xs font-bold text-rose-700">Saldo Pendiente al Fiado: Bs. {notaventa.saldoPendiente.toFixed(2)}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                🖨️ Imprimir Nota de Venta (A4)
              </button>
              <button
                onClick={() => setNotaVenta(null)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anulación de Venta (RF-13, RN-04) */}
      {ventaAAnular && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Autorización de la Dueña • RN-04
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Anular Nota {ventaAAnular.numeroNota}</h3>
              </div>
              <button onClick={() => setVentaAAnular(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              La anulación de una nota es una operación atómica: restituirá los metros al almacén y cancelará el importe de caja o saldo al fiado.
            </p>

            <form onSubmit={handleAnularVenta} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Motivo Obligatorio de Anulación *
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  placeholder="Ej. El cliente se equivocó de tonalidad antes de retirar el corte."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVentaAAnular(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAnulacion}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {procesandoAnulacion ? 'Anulando...' : 'Confirmar Anulación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
