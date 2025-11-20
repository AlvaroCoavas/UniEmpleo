export interface Vacante {
  id?: string;
  empresaId: string;
  titulo: string;
  descripcion: string;
  requisitos?: string;
  ubicacion?: string;
  salario?: number;
  estado?: 'activa' | 'cerrada';
  createdAt?: number;
}