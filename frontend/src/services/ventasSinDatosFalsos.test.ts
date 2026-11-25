import { beforeEach, describe, expect, it, vi } from 'vitest';

// Se reemplaza la API por un mock para probar solo el servicio
vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

describe('servicios de dinero (ventas, cobranzas, caja)', () => {
  let apiFetchStub: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    apiFetchStub = (await import('./api')).apiFetch as unknown as ReturnType<typeof vi.fn>;
    apiFetchStub.mockReset();
  });

  it('registrarVenta_ApiCaida_LanzaErrorEnVezDeInventarLaVenta', async () => {
    apiFetchStub.mockRejectedValue(new Error('sin conexion'));
    const service = await import('./ventaService');

    await expect(
      service.registrarVenta({ lineas: [{ idTela: 1, cantidadMetros: 2 }], metodoPago: 'EFECTIVO' })
    ).rejects.toThrow('sin conexion');
  });

  it('registrarAbono_ApiCaida_LanzaError', async () => {
    apiFetchStub.mockRejectedValue(new Error('sin conexion'));
    const service = await import('./cobranzaService');

    await expect(
      service.registrarAbono({ idVenta: 1, monto: 50, metodoPago: 'EFECTIVO' })
    ).rejects.toThrow('sin conexion');
  });

  it('realizarCierreCaja_EnviaSoloLaObservacion', async () => {
    apiFetchStub.mockResolvedValue({ mensaje: 'ok', cierre: { idCierre: 1 } });
    const service = await import('./cajaService');

    await service.realizarCierreCaja({ observacion: 'Todo cuadrado' });

    expect(apiFetchStub).toHaveBeenCalledWith('/caja/cerrar', {
      method: 'POST',
      body: JSON.stringify({ observacion: 'Todo cuadrado' }),
    });
  });

  it('anularVenta_ConRolVendedor_LanzaErrorSinLlamarALaApi', async () => {
    const service = await import('./ventaService');

    await expect(service.anularVenta(1, 'Error de digitación', 'Vendedor')).rejects.toThrow('Solo la Dueña');
    expect(apiFetchStub).not.toHaveBeenCalled();
  });
});
