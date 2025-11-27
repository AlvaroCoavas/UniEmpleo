export interface Vacante {
  id?: string;
  empresaId?: string;
  personaId?: string;
  titulo: string;
  descripcion: string;
  requisitos?: string;
  ubicacion?: string;
  salario?: number;
  habilidades?: string[];
  disponibilidad?: string;
  modalidad?: 'remoto' | 'hibrido' | 'presencial';
  tarifa?: number;
  estado?: 'activa' | 'cerrada';
  createdAt?: number;
}
