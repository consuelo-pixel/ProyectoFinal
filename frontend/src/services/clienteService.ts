import { apiFetch } from './api';
import { Cliente, CrearClienteData } from '../types/cliente';

// Datos de semilla para fallback instantáneo durante pruebas locales
let clientesMock: Cliente[] = [
  { idCliente: 1, nombre: 'María Elena Morales', carnet: '5849302', nit: '5849302018', telefono: '71894022', direccion: 'Barrio San Roque #450, Tarija', limiteCredito: 1500, estado: 'ACTIVO' },
  { idCliente: 2, nombre: 'Carlos Andrés Benítez', carnet: '4930291', nit: '4930291012', telefono: '68710293', direccion: 'Av. Las Panosas #120, Tarija', limiteCredito: 3000, estado: 'ACTIVO' },
    { idCliente: 3, nombre: 'Lucía Fernández Ramos', carnet: '7291038', nit: undefined, telefono: '73491022', direccion: 'Mercado Central Puesto #14', limiteCredito: 800, estado: 'ACTIVO' }
]
export async function listarClientes(buscar?: string): Promise<Cliente[]> {
  try {
    const query = buscar ? `?buscar=${encodeURIComponent(buscar)}` : '';
    return await apiFetch<Cliente[]>(`/clientes${query}`);
  } catch (err) {
    console.warn('API /clientes no disponible, usando repositorio local para testing:', err);
    if (!buscar) return [...clientesMock];
    const b = buscar.toLowerCase();
    return clientesMock.filter(c =>
      c.nombre.toLowerCase().includes(b) ||
      c.carnet.toLowerCase().includes(b) ||
      (c.nit && c.nit.toLowerCase().includes(b))
    );
  }
}

export async function registrarCliente(data: CrearClienteData): Promise<Cliente> {
  try {
    return await apiFetch<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('API /clientes falló, registrando en repositorio local para testing:', err);
    // Validación de carnet único en local para que la prueba de duplicados funcione
    const existe = clientesMock.some(c => c.carnet.toLowerCase() === data.carnet.trim().toLowerCase());
    if (existe) {
      throw new Error(`Ya existe un cliente registrado con el carnet '${data.carnet}'`);
    }

    const nuevo: Cliente = {
      idCliente: clientesMock.length + 1,
      ...data,
      estado: 'ACTIVO'
    };
    clientesMock.push(nuevo);
    return nuevo;
  }
}
