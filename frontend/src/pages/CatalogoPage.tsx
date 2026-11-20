import React from 'react';

export const CatalogoPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Catálogo en Línea</h2>
        <p className="mt-2 text-sm text-gray-500">
          Consulta de telas públicas (RF-22) sin requerir inicio de sesión.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl font-bold">
          🧵
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Catálogo de Telas en Construcción</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          En el Día 3 se integrará el listado de telas con fotos, precios por metro, colores y existencias disponibles.
        </p>
      </div>
    </div>
  );
};
