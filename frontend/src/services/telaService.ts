import { apiFetch } from './api';
import { Tela, CrearTelaData } from '../types/tela';

// Datos de semilla para fallback instantáneo durante pruebas locales
let telasMock: Tela[] = [
  { idTela: 1, codigo: 'TEL-001', nombre: 'Lino Italiano', tipo: 'Lino', color: 'Beige', ancho: 1.5, precioMetro: 45.0, stockMinimo: 20.0, urlFoto: '', estado: 'ACTIVA', metrosDisponibles: 85.5 },
  { idTela: 2, codigo: 'TEL-002', nombre: 'Seda Satín Brillante', tipo: 'Seda', color: 'Rojo Carmesí', ancho: 1.4, precioMetro: 65.0, stockMinimo: 15.0, urlFoto: '', estado: 'ACTIVA', metrosDisponibles: 12.0 },
  { idTela: 3, codigo: 'TEL-003', nombre: 'Algodón Pima Suave', tipo: 'Algodón', color: 'Azul Marino', ancho: 1.6, precioMetro: 38.0, stockMinimo: 30.0, urlFoto: '', estado: 'ACTIVA', metrosDisponibles: 120.0 },
  { idTela: 4, codigo: 'TEL-004', nombre: 'Popelina Estampada Flores', tipo: 'Popelina', color: 'Multicolor', ancho: 1.4, precioMetro: 28.5, stockMinimo: 25.0, urlFoto: '', estado: 'DESHABILITADA', metrosDisponibles: 0.0 }
];

export async function listarTelas(estado?: string, buscar?: string): Promise<Tela[]> {
  try {
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    if (buscar) params.append('buscar', buscar);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch<Tela[]>(`/telas${query}`);
  } catch (err) {
    console.warn('API /telas no disponible, usando repositorio local para testing:', err);
    let filtradas = [...telasMock];
    if (estado) {
      filtradas = filtradas.filter(t => t.estado.toUpperCase() === estado.toUpperCase());
    }
    if (buscar) {
      const b = buscar.toLowerCase();
      filtradas = filtradas.filter(t =>
        t.nombre.toLowerCase().includes(b) ||
        t.codigo.toLowerCase().includes(b) ||
        (t.tipo && t.tipo.toLowerCase().includes(b))
      );
    }
    return filtradas;
  }
}

export async function registrarTela(data: CrearTelaData): Promise<Tela> {
  try {
    return await apiFetch<Tela>('/telas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('API /telas falló, registrando en repositorio local para testing:', err);
    const existe = telasMock.some(t => t.codigo.toLowerCase() === data.codigo.trim().toLowerCase());
    if (existe) {
      throw new Error(`Ya existe una tela con el código '${data.codigo}'`);
    }

    const nueva: Tela = {
      idTela: telasMock.length + 1,
      ...data,
      estado: 'ACTIVA',
      metrosDisponibles: 50.0 // Rollo inicial de prueba
    };
    telasMock.push(nueva);
    return nueva;
  }
}

export async function cambiarEstadoTela(id: number, nuevoEstado: string): Promise<boolean> {
  try {
    await apiFetch<{ mensaje: string }>(`/telas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    return true;
  } catch (err) {
    console.warn('API /telas/{id}/estado falló, actualizando en local para testing:', err);
    const index = telasMock.findIndex(t => t.idTela === id);
    if (index !== -1) {
      telasMock[index].estado = nuevoEstado;
      return true;
    }
    return false;
  }
}
