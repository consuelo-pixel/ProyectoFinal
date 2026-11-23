import React, { useState, useEffect } from 'react';
import { listarTelas } from '../services/telaService';
import { listarClientes } from '../services/clienteService';
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
  const [telas, setTelas] = useState<Tela[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);

  // Línea actual
  const [telaId, setTelaId] = useState<number>(0);
  const [metros, setMetros] = useState<number>(2.5);

  // Carrito de la venta
  const [lineas, setLineas] = useState<LineaVenta[]>([]);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'QR' | 'TRANSFERENCIA' | 'CREDITO'>('EFECTIVO');
  const [plazoDias, setPlazoDias] = useState<number>(30);

  // Nota de venta generada
  const [notaventa, setNotaVenta] = useState<any | null>(null);

  useEffect(() => {
    listarTelas('ACTIVA').then((t) => {
      setTelas(t);
      if (t.length > 0) setTelaId(t[0].idTela);
    });
    listarClientes().then(setClientes);
  }, []);

  const agregarLinea = () => {
    const t = telas.find((x) => x.idTela === telaId);
    if (!t) return;
    if (metros <= 0) return;

    if (metros > t.metrosDisponibles) {
      alert(`Existencias insuficientes. Metros disponibles en rollo: ${t.metrosDisponibles} m.`);
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

  const finalizarVenta = () => {
    if (lineas.length === 0) {
      alert('Agrega al menos una tela a la venta');
      return;
    }

    if (metodoPago === 'CREDITO' && !clienteSeleccionado) {
      alert('Para ventas a crédito (fiado) es obligatorio seleccionar un cliente registrado.');
      return;
    }

    const clienteObj = clientes.find((c) => c.idCliente === clienteSeleccionado);

    const nuevaNota = {
      nroNota: `NV-${Math.floor(Math.random() * 90000 + 10000)}`,
      fecha: new Date().toLocaleString(),
      vendedor: usuario?.nombre || 'Vendedora Mostrador',
      cliente: clienteObj ? clienteObj.nombre : 'Venta de Mostrador (Sin Registro)',
      carnet: clienteObj ? clienteObj.carnet : '—',
      items: lineas,
      metrosTotales,
      subtotal: subtotalGeneral,
      descuento,
      total: totalPagar,
      metodoPago,
      esCredito: metodoPago === 'CREDITO',
      saldoPendiente: metodoPago === 'CREDITO' ? totalPagar : 0,
      vencimiento: metodoPago === 'CREDITO' ? `Plazo: ${plazoDias} días` : 'Cancelado al contado'
    };

    setNotaVenta(nuevaNota);
    setLineas([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            Módulo de Mostrador
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Registrar Venta de Telas</h2>
          <p className="text-sm text-slate-500">Corte por metro o rollo cerrado con cálculo de descuento y emisión de nota de venta.</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          Atendiendo: <strong className="text-slate-800">{usuario?.nombre || 'Ventas'}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Izquierdo: Selección de tela y cliente */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selección de Cliente */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>👤</span> Datos del Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cliente Registrado
                </label>
                <select
                  value={clienteSeleccionado || ''}
                  onChange={(e) => setClienteSeleccionado(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Mostrador (Cliente casual sin crédito)</option>
                  {clientes.map((c) => (
                    <option key={c.idCliente} value={c.idCliente}>
                      {c.nombre} (CI: {c.carnet} - Límite: Bs. {c.limiteCredito})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Modalidad de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="EFECTIVO">💵 Efectivo en mostrador</option>
                  <option value="QR">📱 Pago por QR</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                  <option value="CREDITO">📝 Venta a Crédito (Fiado)</option>
                </select>
              </div>
            </div>

            {metodoPago === 'CREDITO' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold">⚠️ Venta a Crédito (Cuenta por cobrar)</p>
                <p>El cliente registrará un saldo pendiente equivalente al total de la venta. Plazo acordado:</p>
                <div className="flex gap-2 pt-1">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPlazoDias(d)}
                      className={`px-3 py-1 rounded-lg border font-bold ${
                        plazoDias === d ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700'
                      }`}
                    >
                      {d} días
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Agregar Telas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🧵</span> Corte de Telas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Seleccionar Tela Disponible
                </label>
                <select
                  value={telaId}
                  onChange={(e) => setTelaId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {telas.map((t) => (
                    <option key={t.idTela} value={t.idTela}>
                      {t.nombre} ({t.codigo}) — Bs. {t.precioMetro.toFixed(2)}/m — Disp: {t.metrosDisponibles} m
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Metros a Cortar
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={metros}
                    onChange={(e) => setMetros(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={agregarLinea}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition whitespace-nowrap shadow-sm"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de ítems en la venta */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-600">
              Detalle del Pedido Actual
            </div>
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="text-xs text-slate-500 font-semibold bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 text-left">Tela</th>
                  <th className="px-6 py-3 text-left">Precio/m</th>
                  <th className="px-6 py-3 text-left">Metros</th>
                  <th className="px-6 py-3 text-left">Subtotal</th>
                  <th className="px-6 py-3 text-right">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lineas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No has agregado telas a esta venta. Selecciona una tela y haz clic en "+ Agregar".
                    </td>
                  </tr>
                ) : (
                  lineas.map((l, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {l.tela.nombre} <span className="text-xs font-mono text-slate-400">({l.tela.codigo})</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">Bs. {l.precioMetro.toFixed(2)}</td>
                      <td className="px-6 py-3 font-bold text-slate-800">{l.metros} m</td>
                      <td className="px-6 py-3 font-bold text-emerald-700">Bs. {l.subtotal.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => eliminarLinea(idx)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold"
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

        {/* Panel Derecho: Liquidación y Cobro */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-28">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Resumen de Venta
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Metros acumulados:</span>
                <span className="font-bold text-slate-900">{metrosTotales.toFixed(2)} m</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">Bs. {subtotalGeneral.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold items-center">
                <span>Descuento por Mayor {aplicaDescuentoMayor ? '(10%)' : ''}:</span>
                <span className="font-black">{aplicaDescuentoMayor ? `- Bs. ${descuento.toFixed(2)}` : 'Bs. 0.00'}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-black text-slate-900">Total a Cobrar:</span>
                <span className="text-2xl font-black text-emerald-700">Bs. {totalPagar.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={finalizarVenta}
              disabled={lineas.length === 0}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition"
            >
              Completar Venta y Emitir Nota
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Nota de Venta Generada */}
      {notaventa && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Comprobante de Venta</span>
                <h3 className="text-2xl font-black text-slate-900">{notaventa.nroNota}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{notaventa.fecha}</p>
              </div>
              <button onClick={() => setNotaVenta(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p><strong>Cliente:</strong> {notaventa.cliente} {notaventa.carnet !== '—' && `(CI: ${notaventa.carnet})`}</p>
              <p><strong>Atendido por:</strong> {notaventa.vendedor}</p>
              <p><strong>Forma de pago:</strong> {notaventa.metodoPago} • {notaventa.vencimiento}</p>
            </div>

            {/* Lista de productos */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase">Artículos Facturados:</p>
              <div className="divide-y divide-slate-100 text-xs">
                {notaventa.items.map((it: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between">
                    <span>{it.metros} m de {it.tela.nombre} (Bs. {it.precioMetro}/m)</span>
                    <span className="font-bold text-slate-900">Bs. {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-right">
              <p className="text-slate-500">Subtotal: <strong className="text-slate-800">Bs. {notaventa.subtotal.toFixed(2)}</strong></p>
              {notaventa.descuento > 0 && (
                <p className="text-emerald-700 font-bold">Descuento aplicado: - Bs. {notaventa.descuento.toFixed(2)}</p>
              )}
              <p className="text-lg font-black text-slate-900 pt-1">
                Total Pagado: <span className="text-emerald-700">Bs. {notaventa.total.toFixed(2)}</span>
              </p>
              {notaventa.esCredito && (
                <p className="text-xs font-bold text-rose-700">Saldo Pendiente a Cobrar: Bs. {notaventa.saldoPendiente.toFixed(2)}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                🖨️ Imprimir Nota A4
              </button>
              <button
                onClick={() => setNotaVenta(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Aceptar y Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
