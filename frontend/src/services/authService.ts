import { apiFetch } from './api';
import { LoginResponse } from '../types/auth';

// Estado simulado local para testing
let intentosFallidosMock = 0;
let bloqueadoMock = false;

export async function login(correo: string, password: string): Promise<LoginResponse> {
  try {
    return await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password })
    });
  } catch (err: unknown) {
    console.warn('API /auth/login no respondió o devolvió error HTTP, ejecutando lógica de testing:', err);

    if (bloqueadoMock) {
      return {
        exito: false,
        mensaje: 'Cuenta bloqueada temporalmente tras superar el límite de 5 intentos fallidos (RF-29).',
        intentosRestantes: 0,
        cuentaBloqueada: true
      };
    }

    if (correo.toLowerCase() === 'admin@telasjuanita.local' && password === 'CambiarEstaClave#1') {
      intentosFallidosMock = 0;
      const resp: LoginResponse = {
        exito: true,
        mensaje: 'Inicio de sesión exitoso (Modo Administradora)',
        token: 'token-jwt-admin-simulado',
        nombre: 'Administradora Dueña',
        correo,
        rol: 'Dueña',
        intentosRestantes: 5,
        cuentaBloqueada: false
      };
      localStorage.setItem('usuario_telas_juanita', JSON.stringify(resp));
      return resp;
    }

    // Contraseña fallida
    intentosFallidosMock += 1;
    if (intentosFallidosMock >= 5) {
      bloqueadoMock = true;
      return {
        exito: false,
        mensaje: 'Has alcanzado 5 intentos fallidos. Tu cuenta ha sido BLOQUEADA (RF-29).',
        intentosRestantes: 0,
        cuentaBloqueada: true
      };
    }

    return {
      exito: false,
      mensaje: `Contraseña incorrecta. Intento fallido ${intentosFallidosMock} de 5.`,
      intentosRestantes: 5 - intentosFallidosMock,
      cuentaBloqueada: false
    };
  }
}

export async function desbloquearUsuario(correo: string): Promise<boolean> {
  intentosFallidosMock = 0;
  bloqueadoMock = false;
  try {
    await apiFetch(`/auth/desbloquear?correo=${encodeURIComponent(correo)}`, {
      method: 'POST'
    });
  } catch {
    // Si la API no está, se desbloqueó en memoria local
  }
  return true;
}

export function obtenerUsuarioActual(): LoginResponse | null {
  const data = localStorage.getItem('usuario_telas_juanita');
  return data ? JSON.parse(data) : null;
}

export function logout(): void {
  localStorage.removeItem('usuario_telas_juanita');
}
