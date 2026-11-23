export interface LoginResponse {
  exito: boolean;
  mensaje: string;
  token?: string;
  nombre?: string;
  correo?: string;
  rol?: string;
  intentosRestantes: number;
  cuentaBloqueada: boolean;
}
