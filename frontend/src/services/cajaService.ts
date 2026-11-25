import { apiFetch } from './api';

export interface ResumenCaja {
  fecha: string;
  totalEfectivo: number;
  totalTransferencia: number;
  totalQr: number;
  totalGeneral: number;
  cantidadVentas: number;
  yaCerrado: boolean;
  observacionCierre?: string;
}

export interface CierreCajaHistorial {
  idCierre: number;
  fecha: string;
  totalEfectivo: number;
  totalTransferencia: number;
  totalQr: number;
  totalGeneral: number;
  observacion?: string;
  usuario: string;
}

// Los totales los calcula el servidor; solo se envía la observación
export interface RegistrarCierreData {
  observacion?: string;
}

export async function obtenerResumenCajaHoy(): Promise<ResumenCaja> {
  return await apiFetch<ResumenCaja>('/caja/hoy');
}

export async function realizarCierreCaja(data: RegistrarCierreData): Promise<CierreCajaHistorial> {
  const res = await apiFetch<{ mensaje: string; cierre: CierreCajaHistorial }>('/caja/cerrar', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.cierre;
}

export async function listarHistorialCierres(): Promise<CierreCajaHistorial[]> {
  return await apiFetch<CierreCajaHistorial[]>('/caja/historial');
}
