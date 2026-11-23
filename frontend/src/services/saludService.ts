import { apiFetch } from './api';
import { SaludResponse } from '../types/salud';

export async function consultarSaludSistema(): Promise<SaludResponse> {
  return apiFetch<SaludResponse>('/salud');
}
