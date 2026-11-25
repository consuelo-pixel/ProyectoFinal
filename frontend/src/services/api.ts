// En desarrollo Vite redirige /api al backend (ver vite.config.ts).
// Si la API está en otra dirección, se puede definir VITE_API_URL en un archivo .env
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';

const CLAVE_SESION = 'usuario_telas_juanita';

// Saca el token guardado al iniciar sesión
function obtenerToken(): string | null {
  try {
    const guardado = localStorage.getItem(CLAVE_SESION);
    return guardado ? JSON.parse(guardado).token ?? null : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = obtenerToken();

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.');
  }

  if (response.status === 401) {
    // El token venció o no es válido: se cierra la sesión y se vuelve al login
    localStorage.removeItem(CLAVE_SESION);
    window.location.href = '/login';
    throw new Error('Tu sesión venció. Vuelve a iniciar sesión.');
  }

  if (response.status === 403) {
    throw new Error('No tienes permiso para realizar esta acción.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
  }

  return response.json();
}
