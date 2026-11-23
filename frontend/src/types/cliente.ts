export interface Cliente {
  idCliente: number;
  nombre: string;
  carnet: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  limiteCredito: number;
  estado: string;
}

export interface CrearClienteData {
  nombre: string;
  carnet: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  limiteCredito: number;
}
