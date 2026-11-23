import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fase 3 de la guía: se reemplaza la dependencia externa (la API) por un mock
vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

describe('registrarCliente', () => {
  let service: typeof import('./clienteService');
  let apiFetchStub: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    apiFetchStub = (await import('./api')).apiFetch as unknown as ReturnType<typeof vi.fn>;
    apiFetchStub.mockReset();
    service = await import('./clienteService');
  });

  it('registrarCliente_ConApiDisponible_RetornaElClienteCreado', async () => {
    // Arrange
    const clienteCreado = {
      idCliente: 10,
      nombre: 'Pedro Rojas',
      carnet: '9999999',
      limiteCredito: 500,
      estado: 'ACTIVO',
    };
    apiFetchStub.mockResolvedValue(clienteCreado);

    // Act
    const resultado = await service.registrarCliente({
      nombre: 'Pedro Rojas',
      carnet: '9999999',
      limiteCredito: 500,
    });

    // Assert
    expect(resultado).toEqual(clienteCreado);
    expect(apiFetchStub).toHaveBeenCalledTimes(1);
    expect(apiFetchStub).toHaveBeenCalledWith('/clientes', {
      method: 'POST',
      body: JSON.stringify({ nombre: 'Pedro Rojas', carnet: '9999999', limiteCredito: 500 }),
    });
  });

  it('registrarCliente_ApiCaidaYCarnetNuevo_CreaClienteActivoLocal', async () => {
    // Arrange
    apiFetchStub.mockRejectedValue(new Error('sin conexion'));

    // Act
    const resultado = await service.registrarCliente({
      nombre: 'Pedro Rojas',
      carnet: '9999999',
      limiteCredito: 500,
    });

    // Assert
    expect(resultado.estado).toBe('ACTIVO');
    expect(resultado.nombre).toBe('Pedro Rojas');
  });

  it.each(['5849302', ' 5849302 '])(
    'registrarCliente_CarnetRepetido (%s)_LanzaError',
    async (carnetRepetido) => {
      // Arrange
      apiFetchStub.mockRejectedValue(new Error('sin conexion'));

      // Act & Assert
      await expect(
        service.registrarCliente({
          nombre: 'Otra Persona',
          carnet: carnetRepetido,
          limiteCredito: 0,
        })
      ).rejects.toThrow('Ya existe un cliente registrado con el carnet');
    }
  );
});