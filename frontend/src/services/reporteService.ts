import { apiFetch } from './api';

export interface ResumenVentasPeriodo {
  fechaInicio: string;
  fechaFin: string;
  totalVentasMonto: number;
  cantidadNotasEmitidas: number;
  totalEfectivo: number;
  totalQr: number;
  totalTransferencia: number;
  totalCreditoEmitido: number;
  totalMetrosVendidos: number;
  ticketPromedio: number;
}

export interface RotacionTela {
  idTela: number;
  codigo: string;
  nombre: string;
  color: string;
  metrosVendidos: number;
  montoGenerado: number;
  metrosDisponibles: number;
  nivelRotacion: 'ALTA' | 'MEDIA' | 'ESTANCADA';
  sugerenciaComercial: string;
}

export interface ReporteGeneral {
  ventasPeriodo: ResumenVentasPeriodo;
  rotacionTelas: RotacionTela[];
}

export async function obtenerReporteVentas(desde?: string, hasta?: string): Promise<ResumenVentasPeriodo> {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  const q = params.toString() ? `?${params.toString()}` : '';
  return await apiFetch<ResumenVentasPeriodo>(`/reportes/ventas${q}`);
}

export async function obtenerReporteRotacion(): Promise<RotacionTela[]> {
  return await apiFetch<RotacionTela[]>('/reportes/rotacion');
}

export async function obtenerReporteGeneral(): Promise<ReporteGeneral> {
  return await apiFetch<ReporteGeneral>('/reportes/general');
}
