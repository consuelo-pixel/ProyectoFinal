export interface SaludResponse {
  estado: string;
  mensaje: string;
  baseDeDatos: string;
  rolesRegistrados: number;
  usuariosRegistrados: number;
  fechaUtc: string;
}
