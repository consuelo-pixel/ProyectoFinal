import React from 'react';
import { Link } from 'react-router-dom';

export const InicioPage: React.FC = () => {
  const categorias = [
    { nombre: 'Linos y Tapicería', desc: 'Linos italianos y rústicos de alta durabilidad', color: 'from-amber-700 to-amber-900', badge: 'Alta Demanda' },
    { nombre: 'Sedas y Satines', desc: 'Telas elegantes, suaves y con caída brillante', color: 'from-rose-700 to-pink-900', badge: 'Elegancia' },
    { nombre: 'Algodones Pima', desc: '100% fibra natural para confección fresca y cómoda', color: 'from-sky-700 to-blue-900', badge: 'Clásico' },
    { nombre: 'Popelinas Estampadas', desc: 'Diseños florales, geométricos e infantiles', color: 'from-emerald-700 to-teal-900', badge: 'Variedad' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Banner Principal Hero */}
      <section className="relative bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-5">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
              Tienda Textil en Tarija, Bolivia
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Calidad y variedad en telas por metro, corte y rollo completo.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              En <strong>Telas Juanita</strong> abastecemos a modistas, sastres, confeccionistas y familias tarijeñas con las mejores telas nacionales e importadas. Compra al por menor o aprovecha descuentos por mayor.
            </p>
            <div className="flex flex-wrap gap-4 pt-3">
              <Link
                to="/catalogo"
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition"
              >
                Explorar Catálogo de Telas
              </Link>
              <Link
                to="/telas"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition"
              >
                Control de Existencias
              </Link>
            </div>
          </div>

          <div className="w-full md:w-96 bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl shadow-2xl text-slate-100 space-y-4">
            <h3 className="font-bold text-lg text-white border-b border-white/10 pb-2">
              ✨ Ventajas de Comprar con Nosotros
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Descuento por mayor:</strong> 10% de rebaja automática en compras a partir de 20 metros.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Corte exacto:</strong> Medición en metros con 2 decimales para que lleves justo lo que necesitas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Crédito a clientes frecuentes:</strong> Facilidad de pago y abonos para talleres y confeccionistas.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Categorías Principales */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Variedades y Líneas Textiles</h2>
          <p className="text-sm text-slate-500">Descubre nuestros tejidos más solicitados para confección y decoración.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categorias.map((cat, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 text-white bg-gradient-to-br ${cat.color} shadow-md flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  {cat.badge}
                </span>
                <h3 className="text-xl font-bold mt-2">{cat.nombre}</h3>
                <p className="text-xs text-white/80 mt-1">{cat.desc}</p>
              </div>
              <Link
                to="/catalogo"
                className="text-xs font-bold text-white/90 hover:text-white flex items-center gap-1 mt-4"
              >
                Ver en catálogo →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Información de la Tienda */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              📍
            </div>
            <h4 className="font-bold text-slate-900">Ubicación</h4>
            <p className="text-sm text-slate-500">Zona Comercial Central, Tarija - Bolivia. Visítanos en nuestro mostrador principal.</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              ⏰
            </div>
            <h4 className="font-bold text-slate-900">Horarios de Atención</h4>
            <p className="text-sm text-slate-500">Lunes a Sábado: 8:00 a 12:30 y 14:30 a 19:30. Domingo cerrado por descanso.</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              💳
            </div>
            <h4 className="font-bold text-slate-900">Métodos de Pago</h4>
            <p className="text-sm text-slate-500">Efectivo en mostrador, pagos por código QR, transferencias bancarias y ventas a crédito.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
