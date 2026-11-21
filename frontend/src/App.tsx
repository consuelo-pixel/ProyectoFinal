import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { InicioPage } from './pages/InicioPage';
import { LoginPage } from './pages/LoginPage';
import { CatalogoPage } from './pages/CatalogoPage';
import { ClientesPage } from './pages/ClientesPage';
import { TelasPage } from './pages/TelasPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/telas" element={<TelasPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-slate-700">Telas Juanita • Tarija, Bolivia</p>
            <p className="text-xs text-slate-400">Venta de telas por metro, corte y rollo cerrado • Atención al por mayor y menor</p>
            <p className="text-xs text-slate-400">© 2026 Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
