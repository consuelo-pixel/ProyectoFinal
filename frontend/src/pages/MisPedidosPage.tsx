import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MisPedidosPage: React.FC = () => {
  const { usuario } = useAuth();

  const pedidos = [
    { nro: 'PED-401', fecha: '21/11/2026', tela: 'Lino Italiano (5.0 m)', total: 225.0, estado: 'ENTREGADO', saldo: 0 },
    { nro: 'PED-409', fecha: '23/11/2026', tela: 'Algodón Pima (12.0 m)', total: 456.0, estado: 'CONFIRMADO', saldo: 200.0 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-purple-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Portal de Clientes • Telas Juanita
          </span>
          <h2 className="text-3xl font-black mt-2 tracking-tight">Mis Compras y Saldo</h2>
          <p className="mt-1 text-purple-200 text-sm">
            Bienvenida/o, <strong>{usuario?.nombre || 'Cliente'}</strong>. Consulta tus pedidos y pagos pendientes.
          </p>
        </div>
        <Link
          to="/catalogo"
          className="px-5 py-3 bg-white text-purple-900 font-bold text-xs rounded-xl shadow hover:bg-purple-50 transition self-start sm:self-auto"
        >
          + Hacer Nuevo Pedido
        </Link>
      </div>

      {/* Tarjeta de Saldo Deudor / Crédito (RF-14) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase">Saldo Pendiente de Pago (Crédito / Fiado)</p>
          <p className="text-3xl font-black text-rose-700 mt-1">Bs. 200.00</p>
          <p className="text-xs text-slate-400 mt-0.5">Puedes abonar o cancelar en nuestro mostrador o mediante QR.</p>
        </div>
        <div className="text-right">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
            Crédito al Día
          </span>
        </div>
      </div>

      {/* Historial de Pedidos */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-base">Historial de Pedidos</h3>
        </div>

        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-left">Nro Pedido</th>
              <th className="px-6 py-3.5 text-left">Fecha</th>
              <th className="px-6 py-3.5 text-left">Detalle</th>
              <th className="px-6 py-3.5 text-left">Monto Total</th>
              <th className="px-6 py-3.5 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {pedidos.map((p) => (
              <tr key={p.nro} className="hover:bg-slate-50/70">
                <td className="px-6 py-4 font-mono font-bold text-indigo-700">{p.nro}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{p.fecha}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{p.tela}</td>
                <td className="px-6 py-4 font-bold text-slate-900">Bs. {p.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    p.estado === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
