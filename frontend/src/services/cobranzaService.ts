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

let mockCuentas: CuentaPorCobrar[] = [
  {
    idVenta: 101,
    idCliente: 1,
    nombreCliente: 'María Elena Morales',
    carnetCliente: '5849302 Tarija',
    telefonoCliente: '71894022',
    fechaVenta: new Date(Date.now() - 15 * 86400000).toISOString(),
    totalVenta: 450.00,
    saldoPendiente: 200.00,
    fechaVencimiento: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  },
  {
    idVenta: 104,
    idCliente: 2,
    nombreCliente: 'Carlos Andrés Benítez (Taller de Costura)',
    carnetCliente: '4930291 Tarija',
    telefonoCliente: '68710293',
    fechaVenta: new Date(Date.now() - 7 * 86400000).toISOString(),
    totalVenta: 1250.00,
    saldoPendiente: 750.00,
    fechaVencimiento: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  },
  {
    idVenta: 108,
    idCliente: 3,
    nombreCliente: 'Lucía Fernández Ramos',
    carnetCliente: '7291038 Tarija',
    telefonoCliente: '73491022',
    fechaVenta: new Date(Date.now() - 3 * 86400000).toISOString(),
    totalVenta: 320.00,
    saldoPendiente: 120.00,
    fechaVencimiento: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  }
];

let mockHistorialAbonos: ComprobanteAbono[] = [];

export async function obtenerCuentasPendientes(buscar?: string): Promise<CuentaPorCobrar[]> {
  try {
    const q = buscar ? `?buscar=${encodeURIComponent(buscar)}` : '';
    return await apiFetch<CuentaPorCobrar[]>(`/cobranzas/pendientes${q}`);
  } catch (err) {
    console.warn('API /cobranzas/pendientes no disponible, usando datos de crédito locales:', err);
    if (!buscar) return [...mockCuentas];
    const b = buscar.toLowerCase();
    return mockCuentas.filter(c =>
      c.nombreCliente.toLowerCase().includes(b) ||
      c.carnetCliente.toLowerCase().includes(b)
    );
  }
}

export async function registrarAbono(data: RegistrarAbonoData): Promise<ComprobanteAbono> {
  try {
    const res = await apiFetch<{ mensaje: string; comprobante: ComprobanteAbono }>('/cobranzas/abono', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.comprobante;
  } catch (err) {
    console.warn('API /cobranzas/abono falló, procesando abono local para testing:', err);
    const cuenta = mockCuentas.find(c => c.idVenta === data.idVenta);
    if (!cuenta) {
      throw new Error(`No se encontró la venta a crédito #${data.idVenta}`);
    }
    if (data.monto <= 0) {
      throw new Error('El abono debe ser mayor a 0 Bs.');
    }
    if (data.monto > cuenta.saldoPendiente) {
      throw new Error(`El abono (Bs. ${data.monto.toFixed(2)}) supera el saldo pendiente de Bs. ${cuenta.saldoPendiente.toFixed(2)}`);
    }

    const saldoAnterior = cuenta.saldoPendiente;
    const saldoRestante = Number((saldoAnterior - data.monto).toFixed(2));
    cuenta.saldoPendiente = saldoRestante;

    const comprobante: ComprobanteAbono = {
      idAbono: mockHistorialAbonos.length + 1,
      nroComprobante: `AB-000${mockHistorialAbonos.length + 1}`,
      idVenta: cuenta.idVenta,
      cliente: cuenta.nombreCliente,
      carnet: cuenta.carnetCliente,
      fecha: new Date().toISOString(),
      montoAbonado: data.monto,
      saldoAnterior,
      saldoRestante,
      metodoPago: data.metodoPago,
      cobradoPor: 'Vendedora de Turno'
    };

    mockHistorialAbonos.unshift(comprobante);

    // Si ya pagó todo, remover de la lista de cuentas pendientes
    if (saldoRestante <= 0) {
      mockCuentas = mockCuentas.filter(c => c.idVenta !== data.idVenta);
    }

    return comprobante;
  }
}

export async function obtenerHistorialAbonos(idVenta: number): Promise<ComprobanteAbono[]> {
  try {
    return await apiFetch<ComprobanteAbono[]>(`/cobranzas/historial/${idVenta}`);
  } catch (err) {
    console.warn('API /cobranzas/historial no disponible, usando historial local:', err);
    return mockHistorialAbonos.filter(a => a.idVenta === idVenta);
  }
}
