import { apiFetch, API_BASE_URL } from './api';
import { LoginResponse } from '../types/auth';

const CLAVE_SESION = 'usuario_telas_juanita';

function respuestaConError(mensaje: string): LoginResponse {
  return { exito: false, mensaje, intentosRestantes: 0, cuentaBloqueada: false };
}

function loginDemoFallback(correo: string, pass: string): LoginResponse {
  const c = correo.trim().toLowerCase();

  const usuariosDemo: Record<string, { pass: string[]; nombre: string; rol: string }> = {
    'admin@telasjuanita.local': {
      pass: ['Admin123#', 'CambiarEstaClave#1'],
      nombre: 'Administradora',
      rol: 'Dueña'
    },
    'vendedor@telasjuanita.local': {
      pass: ['Vendedor123#'],
      nombre: 'Mariana Torrez',
      rol: 'Vendedor'
    },
    'almacen@telasjuanita.local': {
      pass: ['Almacen123#'],
      nombre: 'Gonzalo Choque',
      rol: 'Almacen'
    },
    'cliente@telasjuanita.local': {
      pass: ['Cliente123#'],
      nombre: 'María Elena Morales',
      rol: 'Cliente'
    }
  };

  const user = usuariosDemo[c];
  if (user && user.pass.includes(pass)) {
    return {
      exito: true,
      mensaje: 'Inicio de sesión correcto (Modo Demostración)',
      token: 'demo-token-' + Date.now(),
      nombre: user.nombre,
      correo: c,
      rol: user.rol,
      intentosRestantes: 5,
      cuentaBloqueada: false
    };
  }

  return respuestaConError(
    'No se pudo conectar con el servidor (http://localhost:5000). Para probar en modo demostración local usa los botones de Acceso Rápido.'
  );
}

export async function login(correo: string, password: string): Promise<LoginResponse> {
  // Validación básica del lado cliente
  if (!correo || !correo.includes('@')) {
    return respuestaConError('Por favor ingresa un correo electrónico válido (ej. usuario@telasjuanita.local).');
  }
  if (!password || password.length < 6) {
    return respuestaConError('La contraseña debe tener al menos 6 caracteres.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });

    const datos = await response.json().catch(() => null);

    // La API responde con un LoginResponse si entra (200), si falla (401) o si está bloqueada (423)
    if (datos && typeof datos.exito === 'boolean') {
      return datos as LoginResponse;
    }

    // Si hubo errores de validación de modelo ASP.NET (400)
    if (datos?.errors && typeof datos.errors === 'object') {
      const mensajes = Object.values(datos.errors).flat().join('. ');
      return respuestaConError(mensajes || 'Revisa que los datos ingresados sean correctos.');
    }

    // Si la API devolvió un mensaje específico
    if (datos?.mensaje) {
      return respuestaConError(datos.mensaje);
    }

    if (response.status === 404) {
      return respuestaConError('El endpoint /api/auth/login no fue encontrado (404). Verifica que el backend esté corriendo en http://localhost:5000');
    }

    if (response.status >= 500) {
      // Si la API tiene error de conexión a la BD, intentamos el fallback demo para no bloquear la prueba
      const fallback = loginDemoFallback(correo, password);
      if (fallback.exito) return fallback;
      return respuestaConError('Error en el servidor o base de datos. Verifica la conexión con PostgreSQL en appsettings.json.');
    }

    return respuestaConError('No se pudo iniciar sesión. Verifica tus credenciales e intenta nuevamente.');
  } catch {
    // Si la API no está encendida, permitimos usar las cuentas de prueba directamente
    return loginDemoFallback(correo, password);
  }
}

// Solo la Dueña puede desbloquear (la API lo valida con el token)
export async function desbloquearUsuario(correo: string): Promise<boolean> {
  await apiFetch(`/auth/desbloquear?correo=${encodeURIComponent(correo)}`, {
    method: 'POST'
  });
  return true;
}

export function obtenerUsuarioActual(): LoginResponse | null {
  try {
    const data = localStorage.getItem(CLAVE_SESION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(CLAVE_SESION);
}
