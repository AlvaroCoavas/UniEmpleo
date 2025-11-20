export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  role: 'egresado' | 'empresa';
  avatarUrl?: string;
}