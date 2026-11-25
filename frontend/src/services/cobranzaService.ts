import { apiFetch } from './api';

export interface CuentaPorCobrar {
  idVenta: number;
  idCliente: number;
  nombreCliente: string;
  carnetCliente: string;
  telefonoCliente?: string;
  fechaVenta: string;
  totalVenta: number;
  saldoPendiente: number;
  fechaVencimiento?: string;
}

export interface RegistrarAbonoData {
  idVenta: number;
  monto: number;
  metodoPago: string;
}

export interface ComprobanteAbono {
  idAbono: number;
  nroComprobante: string;
  idVenta: number;
  cliente: string;
  carnet: string;
  fecha: string;
  montoAbonado: number;
  saldoAnterior: number;
  saldoRestante: number;
  metodoPago: string;
  cobradoPor: string;
}

export async function obtenerCuentasPendientes(buscar?: string): Promise<CuentaPorCobrar[]> {
  const q = buscar ? `?buscar=${encodeURIComponent(buscar)}` : '';
  return await apiFetch<CuentaPorCobrar[]>(`/cobranzas/pendientes${q}`);
}

export async function registrarAbono(data: RegistrarAbonoData): Promise<ComprobanteAbono> {
  const res = await apiFetch<{ mensaje: string; comprobante: ComprobanteAbono }>('/cobranzas/abono', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.comprobante;
}

export async function obtenerHistorialAbonos(idVenta: number): Promise<ComprobanteAbono[]> {
  return await apiFetch<ComprobanteAbono[]>(`/cobranzas/historial/${idVenta}`);
}
