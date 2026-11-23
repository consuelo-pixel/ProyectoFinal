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
  cerradoPor: string;
}

export interface RegistrarCierreData {
  totalEfectivo?: number;
  totalTransferencia?: number;
  totalQr?: number;
  observacion?: string;
}

let mockCierres: CierreCajaHistorial[] = [
  {
    idCierre: 1,
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    totalEfectivo: 1420.50,
    totalTransferencia: 680.00,
    totalQr: 940.00,
    totalGeneral: 3040.50,
    observacion: 'Cierre de caja sin novedades. Todo cuadrado con boletas.',
    cerradoPor: 'Doña Juanita (Dueña)'
  },
  {
    idCierre: 2,
    fecha: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    totalEfectivo: 980.00,
    totalTransferencia: 420.00,
    totalQr: 550.00,
    totalGeneral: 1950.00,
    observacion: 'Ventas de fin de semana, mayor movimiento en telas de lino.',
    cerradoPor: 'Vendedora María'
  }
];

let mockResumenHoy: ResumenCaja = {
  fecha: new Date().toISOString().split('T')[0],
  totalEfectivo: 850.00,
  totalTransferencia: 320.00,
  totalQr: 410.00,
  totalGeneral: 1580.00,
  cantidadVentas: 12,
  yaCerrado: false
};

export async function obtenerResumenCajaHoy(): Promise<ResumenCaja> {
  try {
    return await apiFetch<ResumenCaja>('/caja/hoy');
  } catch (err) {
    console.warn('API /caja/hoy no disponible, usando datos locales:', err);
    return { ...mockResumenHoy };
  }
}

export async function realizarCierreCaja(data: RegistrarCierreData): Promise<CierreCajaHistorial> {
  try {
    const res = await apiFetch<{ mensaje: string; cierre: CierreCajaHistorial }>('/caja/cerrar', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.cierre;
  } catch (err) {
    console.warn('API /caja/cerrar falló, procesando cierre local:', err);
    if (mockResumenHoy.yaCerrado) {
      throw new Error('La caja del día de hoy ya fue cerrada previamente.');
    }

    const nuevoCierre: CierreCajaHistorial = {
      idCierre: mockCierres.length + 1,
      fecha: mockResumenHoy.fecha,
      totalEfectivo: data.totalEfectivo ?? mockResumenHoy.totalEfectivo,
      totalTransferencia: data.totalTransferencia ?? mockResumenHoy.totalTransferencia,
      totalQr: data.totalQr ?? mockResumenHoy.totalQr,
      totalGeneral: (data.totalEfectivo ?? mockResumenHoy.totalEfectivo) +
                    (data.totalTransferencia ?? mockResumenHoy.totalTransferencia) +
                    (data.totalQr ?? mockResumenHoy.totalQr),
      observacion: data.observacion || 'Cierre de caja completado.',
      cerradoPor: 'Usuario en Turno'
    };

    mockCierres.unshift(nuevoCierre);
    mockResumenHoy.yaCerrado = true;
    mockResumenHoy.observacionCierre = nuevoCierre.observacion;
    return nuevoCierre;
  }
}

export async function listarHistorialCierres(): Promise<CierreCajaHistorial[]> {
  try {
    return await apiFetch<CierreCajaHistorial[]>('/caja/historial');
  } catch (err) {
    console.warn('API /caja/historial no disponible, usando historial local:', err);
    return [...mockCierres];
  }
}
