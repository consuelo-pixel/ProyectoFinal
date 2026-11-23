import React, { useState } from 'react';

interface RolloItem {
  id: number;
  codigoTela: string;
  tela: string;
  metrosIniciales: number;
  metrosDisponibles: number;
  fechaIngreso: string;
}

interface ProveedorItem {
  id: number;
  nombre: string;
  nit: string;
  telefono: string;
}

export const AlmacenPage: React.FC = () => {
  const [rollos, setRollos] = useState<RolloItem[]>([
    { id: 101, codigoTela: 'TEL-001', tela: 'Lino Italiano', metrosIniciales: 100, metrosDisponibles: 85.5, fechaIngreso: '18/11/2026' },
    { id: 102, codigoTela: 'TEL-002', tela: 'Seda Satín', metrosIniciales: 50, metrosDisponibles: 12.0, fechaIngreso: '19/11/2026' },
    { id: 103, codigoTela: 'TEL-003', tela: 'Algodón Pima', metrosIniciales: 150, metrosDisponibles: 120.0, fechaIngreso: '20/11/2026' }
  ]);

  const [proveedores] = useState<ProveedorItem[]>([
    { id: 1, nombre: 'Textiles La Paz S.R.L.', nit: '1029384029', telefono: '22489012' },
    { id: 2, nombre: 'Importadora Santa Cruz Telas', nit: '4930291018', telefono: '33491022' },
    { id: 3, nombre: 'Fábrica Textil Cochabamba', nit: '7291029384', telefono: '44819022' }
  ]);

  // Modal ajuste inventario
  const [modalAjuste, setModalAjuste] = useState(false);
  const [rolloSel, setRolloSel] = useState<RolloItem | null>(null);
  const [tipoAjuste, setTipoAjuste] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('AJUSTE');
  const [metrosAjuste, setMetrosAjuste] = useState<number>(2.0);
  const [motivo, setMotivo] = useState<string>('');

  const guardarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      alert('El motivo del ajuste es obligatorio según la regla de inventario (RF-06).');
      return;
    }

    if (rolloSel) {
      setRollos(rollos.map(r => {
        if (r.id === rolloSel.id) {
          const nuevo = tipoAjuste === 'ENTRADA' ? r.metrosDisponibles + metrosAjuste : r.metrosDisponibles - metrosAjuste;
          return { ...r, metrosDisponibles: Math.max(0, Number(nuevo.toFixed(2))) };
        }
        return r;
      }));
    }

    alert(`Ajuste registrado con éxito: ${tipoAjuste} de ${metrosAjuste} m con motivo: "${motivo}".`);
    setModalAjuste(false);
    setMotivo('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado Almacén */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
            Módulo de Almacén y Compras
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Gestión de Rollos y Proveedores</h2>
          <p className="text-sm text-slate-500">Ingreso de nuevos rollos de tela, ajustes de existencias por merma y compras.</p>
        </div>
      </div>

      {/* Tabla de Rollos Físicos (RF-03) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rollos en Existencia</h3>
            <p className="text-xs text-slate-500">Cada rollo físico con su metraje inicial y disponible.</p>
          </div>
        </div>

        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-left">Nro Rollo</th>
              <th className="px-6 py-3.5 text-left">Tela</th>
              <th className="px-6 py-3.5 text-left">Metros Iniciales</th>
              <th className="px-6 py-3.5 text-left">Metros Disponibles</th>
              <th className="px-6 py-3.5 text-left">Fecha Ingreso</th>
              <th className="px-6 py-3.5 text-right">Ajuste (RF-06)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rollos.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4 font-mono font-bold text-sky-700">#ROL-{r.id}</td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {r.tela} <span className="text-xs text-slate-400">({r.codigoTela})</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{r.metrosIniciales} m</td>
                <td className="px-6 py-4 font-black text-emerald-700">{r.metrosDisponibles} m</td>
                <td className="px-6 py-4 text-xs text-slate-500">{r.fechaIngreso}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => { setRolloSel(r); setModalAjuste(true); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Ajustar Metros
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proveedores de Telas (RF-20) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Proveedores Registrados</h3>
        <p className="text-xs text-slate-500">Empresas textileras nacionales que suministran rollos a Telas Juanita.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {proveedores.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
              <p className="font-bold text-slate-900 text-sm">{p.nombre}</p>
              <p className="text-slate-500">NIT: <strong className="text-slate-700">{p.nit}</strong></p>
              <p className="text-slate-500">Contacto: <strong className="text-slate-700">{p.telefono}</strong></p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Ajustar Inventario con Motivo (RF-06) */}
      {modalAjuste && rolloSel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Ajuste de Inventario (RF-06)</h3>
              <button onClick={() => setModalAjuste(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={guardarAjuste} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Rollo seleccionado: <strong>#ROL-{rolloSel.id} ({rolloSel.tela})</strong>. Disponible actual: {rolloSel.metrosDisponibles} m.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Movimiento</label>
                <select
                  value={tipoAjuste}
                  onChange={(e) => setTipoAjuste(e.target.value as any)}
                  className="w-full p-2 border rounded-xl"
                >
                  <option value="AJUSTE">Ajuste por merma / falla textil</option>
                  <option value="ENTRADA">Entrada adicional de metros</option>
                  <option value="SALIDA">Salida extraordinaria</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cantidad de Metros a Ajustar</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  value={metrosAjuste}
                  onChange={(e) => setMetrosAjuste(Number(e.target.value))}
                  className="w-full p-2 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo Obligatorio (RF-06) *</label>
                <textarea
                  required
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Mancha de fábrica en borde o merma por corte desigual..."
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalAjuste(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
