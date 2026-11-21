import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { InicioPage } from './pages/InicioPage';
import { LoginPage } from './pages/LoginPage';
import { CatalogoPage } from './pages/CatalogoPage';
import { ClientesPage } from './pages/ClientesPage';
import { TelasPage } from './pages/TelasPage';
import { TestingLabPage } from './pages/TestingLabPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/telas" element={<TelasPage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/testing" element={<TestingLabPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
          <p>© 2026 Telas Juanita - Sistema de Gestión en Tres Capas (React + TypeScript + .NET + PostgreSQL)</p>
          <p className="mt-1 text-[11px] text-gray-400">Tarija, Bolivia • Versión 1.2</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
