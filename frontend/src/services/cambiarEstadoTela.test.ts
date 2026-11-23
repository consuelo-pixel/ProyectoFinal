import { beforeEach, describe, expect, it, vi } from 'vitcdest';

// Fase 3 de la guía: se reemplaza la dependencia externa (la API) por un mock
vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

describe('cambiarEstadoTela', () => {
  let service: typeof import('./telaService');
  let apiFetchStub: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    apiFetchStub = (await import('./api')).apiFetch as unknown as ReturnType<typeof vi.fn>;
    apiFetchStub.mockReset();
    service = await import('./telaService');
  });

  it.each(['ACTIVA', 'DESHABILITADA'])(
    'cambiarEstadoTela_ConApiDisponible (%s)_RetornaTrueYLlamaALaApi',
    async (nuevoEstado) => {
      // Arrange
      apiFetchStub.mockResolvedValue({ mensaje: 'ok' });

      // Act
      const resultado = await service.cambiarEstadoTela(1, nuevoEstado);

      // Assert
      expect(resultado).toBe(true);
      expect(apiFetchStub).toHaveBeenCalledTimes(1);
      expect(apiFetchStub).toHaveBeenCalledWith('/telas/1/estado', {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado }),
      });
    }
  );

  it('cambiarEstadoTela_ApiCaidaYTelaExistente_ActualizaElEstadoLocal', async () => {
    // Arrange
    apiFetchStub.mockRejectedValue(new Error('sin conexion'));

    // Act
    const resultado = await service.cambiarEstadoTela(1, 'DESHABILITADA');

    // Assert
    const deshabilitadas = await service.listarTelas('DESHABILITADA');
    expect(resultado).toBe(true);
    expect(deshabilitadas.map(t => t.idTela)).toContain(1);
  });

  it('cambiarEstadoTela_ApiCaidaYTelaInexistente_RetornaFalse', async () => {
    // Arrange
    apiFetchStub.mockRejectedValue(new Error('sin conexion'));

    // Act
    const resultado = await service.cambiarEstadoTela(999, 'ACTIVA');

    // Assert
    expect(resultado).toBe(false);
  });
});