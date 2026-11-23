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

let mockVentas: NotaVenta[] = [
  {
    idVenta: 101,
    numeroNota: 'NV-000101',
    fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
    idCliente: 1,
    cliente: 'María Elena Morales',
    carnet: '5849302 Tarija',
    vendedor: 'Mariana Torrez',
    metrosTotales: 22.0,
    subtotal: 660.0,
    descuento: 66.0, // 10% descuento por mayor
    total: 594.0,
    metodoPago: 'EFECTIVO',
    esCredito: false,
    saldoPendiente: 0,
    estado: 'REGISTRADA',
    detalles: [
      {
        idDetalleVenta: 1,
        idTela: 1,
        codigoTela: 'TEL-001',
        nombreTela: 'Lino Italiano Premium',
        color: 'Azul Marino',
        cantidadMetros: 22.0,
        precioUnitario: 30.0,
        subtotal: 660.0
      }
    ]
  },
  {
    idVenta: 102,
    numeroNota: 'NV-000102',
    fecha: new Date(Date.now() - 3600000 * 4).toISOString(),
    idCliente: 2,
    cliente: 'Carlos Andrés Benítez',
    carnet: '4930291 Tarija',
    vendedor: 'Mariana Torrez',
    metrosTotales: 15.0,
    subtotal: 675.0,
    descuento: 0,
    total: 675.0,
    metodoPago: 'CREDITO',
    esCredito: true,
    saldoPendiente: 675.0,
    fechaVencimiento: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    estado: 'REGISTRADA',
    detalles: [
      {
        idDetalleVenta: 2,
        idTela: 2,
        codigoTela: 'TEL-002',
        nombreTela: 'Seda Fría Estampada',
        color: 'Floral Borgoña',
        cantidadMetros: 15.0,
        precioUnitario: 45.0,
        subtotal: 675.0
      }
    ]
  }
];

export async function registrarVenta(input: RegistrarVentaInput): Promise<NotaVenta> {
  try {
    return await apiFetch<NotaVenta>('/ventas', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  } catch (err) {
    console.warn('API /ventas no disponible, simulando registro local:', err);

    const metrosTotales = input.lineas.reduce((acc, l) => acc + l.cantidadMetros, 0);
    const subtotal = Number((metrosTotales * 35.0).toFixed(2));
    const aplicaDescuento = metrosTotales >= 20;
    const descuento = aplicaDescuento ? Number((subtotal * 0.10).toFixed(2)) : 0;
    const total = Number((subtotal - descuento).toFixed(2));
    const esCredito = input.metodoPago === 'CREDITO';

    const nuevaNota: NotaVenta = {
      idVenta: mockVentas.length + 101,
      numeroNota: `NV-000${mockVentas.length + 101}`,
      fecha: new Date().toISOString(),
      idCliente: input.idCliente,
      cliente: input.idCliente ? 'Cliente Registrado' : 'Venta de Mostrador',
      carnet: input.idCliente ? '5849302 Tarija' : '—',
      vendedor: 'Vendedora Mostrador',
      metrosTotales,
      subtotal,
      descuento,
      total,
      metodoPago: input.metodoPago,
      esCredito,
      saldoPendiente: esCredito ? total : 0,
      fechaVencimiento: esCredito ? new Date(Date.now() + (input.plazoDiasCredito || 30) * 86400000).toISOString().split('T')[0] : undefined,
      estado: 'REGISTRADA',
      detalles: input.lineas.map((l, i) => ({
        idDetalleVenta: i + 1,
        idTela: l.idTela,
        codigoTela: `TEL-00${l.idTela}`,
        nombreTela: 'Tela Textil Tarija',
        color: 'Surtido',
        cantidadMetros: l.cantidadMetros,
        precioUnitario: 35.0,
        subtotal: Number((l.cantidadMetros * 35.0).toFixed(2))
      }))
    };

    mockVentas.unshift(nuevaNota);
    return nuevaNota;
  }
}

export async function listarVentasRecientes(): Promise<NotaVenta[]> {
  try {
    return await apiFetch<NotaVenta[]>('/ventas/recientes');
  } catch (err) {
    console.warn('API /ventas/recientes no disponible, usando histórico local:', err);
    return [...mockVentas];
  }
}

export async function anularVenta(idVenta: number, motivo: string, rolUsuario: string): Promise<void> {
  if (rolUsuario !== 'Dueña') {
    throw new Error('Solo la Dueña de la tienda tiene autorización para anular notas de venta (RN-04).');
  }

  try {
    await apiFetch('/ventas/anular', {
      method: 'POST',
      headers: {
        'X-Rol-Usuario': rolUsuario
      },
      body: JSON.stringify({ idVenta, motivo })
    });
  } catch (err) {
    console.warn('API /ventas/anular falló, procesando anulación local:', err);
    const venta = mockVentas.find(v => v.idVenta === idVenta);
    if (!venta) throw new Error('Venta no encontrada');
    venta.estado = 'ANULADA';
    venta.motivoAnulacion = motivo;
  }
}
