import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RutaProtegida } from './components/RutaProtegida';
import { Navbar } from './components/Navbar';
import { InicioPage } from './pages/InicioPage';
import { LoginPage } from './pages/LoginPage';
import { CatalogoPage } from './pages/CatalogoPage';
import { ClientesPage } from './pages/ClientesPage';
import { TelasPage } from './pages/TelasPage';
import { VentasPage } from './pages/VentasPage';
import { AdminPage } from './pages/AdminPage';
import { AlmacenPage } from './pages/AlmacenPage';
import { MisPedidosPage } from './pages/MisPedidosPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<InicioPage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Rutas para Vendedora y Dueña */}
              <Route
                path="/ventas"
                element={
                  <RutaProtegida rolesPermitidos={['Dueña', 'Vendedor']}>
                    <VentasPage />
                  </RutaProtegida>
                }
              />
              <Route
                path="/clientes"
                element={
                  <RutaProtegida rolesPermitidos={['Dueña', 'Vendedor']}>
                    <ClientesPage />
                  </RutaProtegida>
                }
              />

              {/* Rutas para Almacén y Dueña */}
              <Route
                path="/telas"
                element={
                  <RutaProtegida rolesPermitidos={['Dueña', 'Almacen']}>
                    <TelasPage />
                  </RutaProtegida>
                }
              />
              <Route
                path="/almacen"
                element={
                  <RutaProtegida rolesPermitidos={['Dueña', 'Almacen']}>
                    <AlmacenPage />
                  </RutaProtegida>
                }
              />

              {/* Ruta Exclusiva de la Dueña (Acceso Total) */}
              <Route
                path="/admin"
                element={
                  <RutaProtegida rolesPermitidos={['Dueña']}>
                    <AdminPage />
                  </RutaProtegida>
                }
              />

              {/* Ruta Exclusiva del Cliente */}
              <Route
                path="/mis-pedidos"
                element={
                  <RutaProtegida rolesPermitidos={['Cliente']}>
                    <MisPedidosPage />
                  </RutaProtegida>
                }
              />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
            <div className="max-w-7xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-slate-700">Telas Juanita • Tarija, Bolivia</p>
              <p className="text-xs text-slate-400">Sistema de Gestión Textil con Control de Acceso por Roles (Dueña, Vendedor, Almacén, Cliente)</p>
              <p className="text-xs text-slate-400">© 2026 Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
