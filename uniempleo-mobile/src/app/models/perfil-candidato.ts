export interface PerfilCandidato {
  id?: string;
  usuarioId: string;
  habilidades: string[];
  disponibilidad?: string;
  ubicacion?: string;
  tarifaPreferida?: number;
  documentosVerificados?: string[];
}
