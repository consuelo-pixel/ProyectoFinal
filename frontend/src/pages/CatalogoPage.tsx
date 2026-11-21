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

  // Regla de Negocio RN-09: Descuento por mayor (si compra > 20 metros, 10% descuento)
  const aplicaDescuento = metrosDeseados >= 20;
  const precioUnitario = telaSeleccionada?.precioMetro || 0;
  const subtotalSinDesc = precioUnitario * metrosDeseados;
  const descuento = aplicaDescuento ? subtotalSinDesc * 0.10 : 0;
  const total = subtotalSinDesc - descuento;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            Módulo RF-22: Catálogo en Línea
          </span>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 mt-1 sm:text-3xl">
            Catálogo de Telas Juanita
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Consulta pública sin iniciar sesión. Selecciona una tela para calcular costos y descuentos por mayor (RF-09).
          </p>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre, tipo o color..."
            className="w-full text-xs p-2.5 border rounded-lg bg-white shadow-sm outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grilla de Telas */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {telasFiltradas.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-white rounded-xl border text-gray-400 text-sm">
              No se encontraron telas activas con el filtro "{buscar}".
            </div>
          ) : (
            telasFiltradas.map((t) => (
              <div
                key={t.idTela}
                onClick={() => setTelaSeleccionada(t)}
                className={`bg-white rounded-xl border p-5 shadow-sm cursor-pointer transition relative hover:border-emerald-500 ${
                  telaSeleccionada?.idTela === t.idTela
                    ? 'ring-2 ring-emerald-500 border-transparent bg-emerald-50/20'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                      {t.codigo}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-1">{t.nombre}</h3>
                  </div>
                  <span className="text-base font-extrabold text-emerald-700">
                    Bs. {t.precioMetro.toFixed(2)}
                    <span className="text-[10px] font-normal text-gray-500 block text-right">por metro</span>
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p>Tipo: <strong className="text-gray-700">{t.tipo || 'General'}</strong></p>
                  <p>Color: <strong className="text-gray-700">{t.color || 'Estándar'}</strong></p>
                  <p>Ancho: <strong className="text-gray-700">{t.ancho ? `${t.ancho} m` : '1.5 m'}</strong></p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Existencias:</span>
                  <span className="font-semibold text-gray-700">{t.metrosDisponibles.toFixed(1)} metros</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Simulador y Calculadora de Corte / Venta (RF-08, RF-09) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit space-y-5 sticky top-24">
          <div className="border-b pb-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Calculadora de Compra</span>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">Cotizar Corte de Tela</h3>
          </div>

          {telaSeleccionada ? (
            <div className="space-y-4 text-sm">
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 text-xs">
                <p className="font-bold text-emerald-900">{telaSeleccionada.nombre}</p>
                <p className="text-emerald-700">Código: {telaSeleccionada.codigo} | Bs. {telaSeleccionada.precioMetro.toFixed(2)}/m</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cantidad de metros a solicitar:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={metrosDeseados}
                    onChange={(e) => setMetrosDeseados(Math.max(0.1, Number(e.target.value)))}
                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-gray-900"
                  />
                  <span className="text-xs text-gray-500 font-medium">metros</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[2, 5, 10, 25, 50].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetrosDeseados(m)}
                      className={`text-xs px-2 py-1 rounded border transition ${
                        metrosDeseados === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {m} m
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalle del cálculo */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({metrosDeseados} m x Bs. {precioUnitario.toFixed(2)}):</span>
                  <span className="font-semibold text-gray-800">Bs. {subtotalSinDesc.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-700">
                  <span className="flex items-center gap-1 font-medium">
                    Descuento por Mayor (RF-09) {aplicaDescuento ? '(10%)' : ''}:
                  </span>
                  <span className="font-bold">
                    {aplicaDescuento ? `- Bs. ${descuento.toFixed(2)}` : 'Bs. 0.00'}
                  </span>
                </div>
                {!aplicaDescuento && (
                  <p className="text-[10px] text-gray-400 italic">
                    Tip: A partir de 20 metros aplica un 10% de descuento automático.
                  </p>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-gray-900">Total a Pagar:</span>
                  <span className="text-lg font-extrabold text-emerald-700">Bs. {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 text-center">
                Disponibilidad en rollo: {telaSeleccionada.metrosDisponibles} m
                {metrosDeseados > telaSeleccionada.metrosDisponibles && (
                  <p className="text-red-600 font-semibold mt-1">
                    ⚠️ La cantidad solicitada supera los metros disponibles en inventario.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              👈 Haz clic en una tela del catálogo para ver su cotizador.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
