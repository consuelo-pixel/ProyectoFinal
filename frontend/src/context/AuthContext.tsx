import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, obtenerUsuarioActual } from '../services/authService';
import { LoginResponse } from '../types/auth';

export type RolUsuario = 'Dueña' | 'Vendedor' | 'Almacen' | 'Cliente';

export interface UsuarioAutenticado {
  nombre: string;
  correo: string;
  rol: RolUsuario;
  token: string;
}

interface AuthContextType {
  usuario: UsuarioAutenticado | null;
  cargando: boolean;
  iniciarSesion: (correo: string, pass: string) => Promise<LoginResponse>;
  cerrarSesion: () => void;
  tienePermiso: (rolesPermitidos: RolUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardado = obtenerUsuarioActual();
    if (guardado && guardado.exito && guardado.token) {
      setUsuario({
        nombre: guardado.nombre || 'Usuario',
        correo: guardado.correo || '',
        rol: (guardado.rol as RolUsuario) || 'Cliente',
        token: guardado.token
      });
    }
    setCargando(false);
  }, []);

  const iniciarSesion = async (correo: string, pass: string): Promise<LoginResponse> => {
    const res = await loginService(correo, pass);
    if (res.exito && res.token) {
      const u: UsuarioAutenticado = {
        nombre: res.nombre || 'Usuario',
        correo: res.correo || correo,
        rol: (res.rol as RolUsuario) || 'Cliente',
        token: res.token
      };
      setUsuario(u);
      localStorage.setItem('usuario_telas_juanita', JSON.stringify(res));
    }
    return res;
  };

  const cerrarSesion = () => {
    logoutService();
    setUsuario(null);
  };

  const tienePermiso = (rolesPermitidos: RolUsuario[]): boolean => {
    if (!usuario) return false;
    // La Dueña tiene acceso total a todos los módulos
    if (usuario.rol === 'Dueña') return true;
    return rolesPermitidos.includes(usuario.rol);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
        cerrarSesion,
        tienePermiso
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
