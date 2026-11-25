import { apiFetch } from './api';

export interface LineaVentaInput {
  idTela: number;
  idRollo?: number;
  cantidadMetros: number;
}

export interface RegistrarVentaInput {
  idCliente?: number;
  lineas: LineaVentaInput[];
  metodoPago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA' | 'CREDITO';
  plazoDiasCredito?: number;
}

export interface DetalleNotaVenta {
  idDetalleVenta: number;
  idTela: number;
  codigoTela: string;
  nombreTela: string;
  color: string;
  cantidadMetros: number;
  precioUnitario: number;
  subtotal: number;
}

export interface NotaVenta {
  idVenta: number;
  numeroNota: string;
  fecha: string;
  idCliente?: number;
  cliente: string;
  carnet: string;
  vendedor: string;
  metrosTotales: number;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  esCredito: boolean;
  saldoPendiente: number;
  fechaVencimiento?: string;
  estado: string;
  motivoAnulacion?: string;
  detalles: DetalleNotaVenta[];
}

export async function registrarVenta(input: RegistrarVentaInput): Promise<NotaVenta> {
  return await apiFetch<NotaVenta>('/ventas', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function listarVentasRecientes(): Promise<NotaVenta[]> {
  return await apiFetch<NotaVenta[]>('/ventas/recientes');
}

export async function anularVenta(idVenta: number, motivo: string, rolUsuario: string): Promise<void> {
  // Esta revisión es solo para avisar rápido; la API vuelve a validar el rol con el token (RN-04)
  if (rolUsuario !== 'Dueña') {
    throw new Error('Solo la Dueña de la tienda tiene autorización para anular notas de venta (RN-04).');
  }

  await apiFetch('/ventas/anular', {
    method: 'POST',
    body: JSON.stringify({ idVenta, motivo })
  });
}
