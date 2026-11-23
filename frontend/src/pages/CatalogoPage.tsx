import React, { useEffect, useState } from 'react';
import { listarTelas } from '../services/telaService';
import { Tela } from '../types/tela';

export const CatalogoPage: React.FC = () => {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [buscar, setBuscar] = useState('');
  const [telaSeleccionada, setTelaSeleccionada] = useState<Tela | null>(null);
  const [metrosDeseados, setMetrosDeseados] = useState<number>(3.5);

  useEffect(() => {
    listarTelas('ACTIVA').then(setTelas);
  }, []);

  const telasFiltradas = telas.filter(t =>
    t.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (t.tipo && t.tipo.toLowerCase().includes(buscar.toLowerCase())) ||
    (t.color && t.color.toLowerCase().includes(buscar.toLowerCase()))
  );

  // Descuento comercial por mayor: a partir de 20 metros aplica 10%
  const aplicaDescuento = metrosDeseados >= 20;
  const precioUnitario = telaSeleccionada?.precioMetro || 0;
  const subtotalSinDesc = precioUnitario * metrosDeseados;
  const descuento = aplicaDescuento ? subtotalSinDesc * 0.10 : 0;
  const total = subtotalSinDesc - descuento;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Catálogo de Telas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Precios actualizados por metro. Elige una tela para calcular el costo de tu corte o pedido al por mayor.
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre, tipo o color..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grilla de Telas */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {telasFiltradas.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              No se encontraron telas disponibles con el criterio "{buscar}".
            </div>
          ) : (
            telasFiltradas.map((t) => (
              <div
                key={t.idTela}
                onClick={() => setTelaSeleccionada(t)}
                className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:border-emerald-500 ${
                  telaSeleccionada?.idTela === t.idTela
                    ? 'ring-2 ring-emerald-600 border-transparent bg-emerald-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      {t.codigo}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{t.nombre}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-700">
                      Bs. {t.precioMetro.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">por metro</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p>Tejido: <strong className="text-slate-700">{t.tipo || 'General'}</strong></p>
                  <p>Tono: <strong className="text-slate-700">{t.color || 'Varios'}</strong></p>
                  <p>Ancho: <strong className="text-slate-700">{t.ancho ? `${t.ancho} m` : '1.50 m'}</strong></p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">En almacén:</span>
                  <span className="font-bold text-slate-700">{t.metrosDisponibles.toFixed(1)} metros</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cotizador de Pedido */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm h-fit space-y-5 sticky top-28">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900">Cotizador de Telas</h3>
            <p className="text-xs text-slate-500">Calcula tu corte con descuento automático</p>
          </div>

          {telaSeleccionada ? (
            <div className="space-y-5 text-sm">
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 text-xs">
                <p className="font-bold text-emerald-900 text-sm">{telaSeleccionada.nombre}</p>
                <p className="text-emerald-700 font-semibold mt-0.5">
                  Bs. {telaSeleccionada.precioMetro.toFixed(2)} por metro • Ancho: {telaSeleccionada.ancho || 1.5} m
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Metros que deseas comprar:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={metrosDeseados}
                    onChange={(e) => setMetrosDeseados(Math.max(0.1, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-bold">metros</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[2, 5, 10, 20, 50].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetrosDeseados(m)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition ${
                        metrosDeseados === m
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {m} m
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalle económico */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal ({metrosDeseados} m x Bs. {precioUnitario.toFixed(2)}):</span>
                  <span className="font-semibold text-slate-800">Bs. {subtotalSinDesc.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-semibold">
                    Descuento por Mayor {aplicaDescuento ? '(10%)' : ''}:
                  </span>
                  <span className="font-black">
                    {aplicaDescuento ? `- Bs. ${descuento.toFixed(2)}` : 'Bs. 0.00'}
                  </span>
                </div>
                {!aplicaDescuento && (
                  <p className="text-[11px] text-slate-400 italic">
                    Compra 20 metros o más para recibir un 10% de descuento automático.
                  </p>
                )}

                <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-sm">
                  <span className="font-black text-slate-900">Total a Pagar:</span>
                  <span className="text-xl font-black text-emerald-700">Bs. {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center font-medium">
                Metros disponibles en almacén: {telaSeleccionada.metrosDisponibles} m
                {metrosDeseados > telaSeleccionada.metrosDisponibles && (
                  <p className="text-rose-600 font-bold mt-1">
                    ⚠️ La cantidad deseada excede el metraje actual disponible.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              👈 Selecciona una tela del catálogo para cotizar tu compra en vivo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
