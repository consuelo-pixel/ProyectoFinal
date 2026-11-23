export interface Tela {
  idTela: number;
  codigo: string;
  nombre: string;
  tipo?: string;
  color?: string;
  ancho?: number;
  precioMetro: number;
  stockMinimo: number;
  urlFoto?: string;
  estado: string;
  metrosDisponibles: number;
}

export interface CrearTelaData {
  codigo: string;
  nombre: string;
  tipo?: string;
  color?: string;
  ancho?: number;
  precioMetro: number;
  stockMinimo: number;
  urlFoto?: string;
}
