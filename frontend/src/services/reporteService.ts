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

const mockReporte: ReporteGeneral = {
  ventasPeriodo: {
    fechaInicio: new Date(Date.now() - 30 * 86400000).toISOString(),
    fechaFin: new Date().toISOString(),
    totalVentasMonto: 16840.00,
    cantidadNotasEmitidas: 54,
    totalEfectivo: 7420.00,
    totalQr: 4210.00,
    totalTransferencia: 2850.00,
    totalCreditoEmitido: 2360.00,
    totalMetrosVendidos: 560.50,
    ticketPromedio: 311.85
  },
  rotacionTelas: [
    {
      idTela: 1,
      codigo: 'TEL-001',
      nombre: 'Lino Italiano Premium',
      color: 'Azul Marino',
      metrosVendidos: 135.50,
      montoGenerado: 4065.00,
      metrosDisponibles: 45.00,
      nivelRotacion: 'ALTA',
      sugerenciaComercial: 'Tela estrella con máxima salida. Reabastecer rollos con anticipación.'
    },
    {
      idTela: 2,
      codigo: 'TEL-002',
      nombre: 'Seda Satín Brillante',
      color: 'Rojo Carmesí',
      metrosVendidos: 74.00,
      montoGenerado: 3330.00,
      metrosDisponibles: 12.00,
      nivelRotacion: 'ALTA',
      sugerenciaComercial: 'Stock crítico por debajo del mínimo (12 m restantes). Pedir reposición.'
    },
    {
      idTela: 3,
      codigo: 'TEL-003',
      nombre: 'Algodón Pima Suave',
      color: 'Blanco Óptico',
      metrosVendidos: 42.00,
      montoGenerado: 1176.00,
      metrosDisponibles: 120.00,
      nivelRotacion: 'MEDIA',
      sugerenciaComercial: 'Venta constante y estable. Inventario en equilibrio.'
    },
    {
      idTela: 4,
      codigo: 'TEL-004',
      nombre: 'Popelina Estampada Flores',
      color: 'Multicolor',
      metrosVendidos: 4.50,
      montoGenerado: 128.25,
      metrosDisponibles: 95.50,
      nivelRotacion: 'ESTANCADA',
      sugerenciaComercial: 'Lenta rotación comercial. Sugerencia: promover en vitrina o venta por retazos.'
    }
  ]
};

export async function obtenerReporteVentas(desde?: string, hasta?: string): Promise<ResumenVentasPeriodo> {
  try {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch<ResumenVentasPeriodo>(`/reportes/ventas${q}`);
  } catch (err) {
    console.warn('API /reportes/ventas no disponible, usando métricas locales:', err);
    return { ...mockReporte.ventasPeriodo };
  }
}

export async function obtenerReporteRotacion(): Promise<RotacionTela[]> {
  try {
    return await apiFetch<RotacionTela[]>('/reportes/rotacion');
  } catch (err) {
    console.warn('API /reportes/rotacion no disponible, usando análisis local:', err);
    return [...mockReporte.rotacionTelas];
  }
}

export async function obtenerReporteGeneral(): Promise<ReporteGeneral> {
  try {
    return await apiFetch<ReporteGeneral>('/reportes/general');
  } catch (err) {
    console.warn('API /reportes/general no disponible, usando datos locales:', err);
    return { ...mockReporte };
  }
}
