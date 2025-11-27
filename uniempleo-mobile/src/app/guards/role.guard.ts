import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioDatosSupabase } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class ProtectorRol implements CanActivate {
  constructor(
    private router: Router,
    private supabase: ServicioDatosSupabase
  ) {}
  async canActivate(route: any) {
    const esperado: 'empresa' | 'egresado' = route.data?.role;
    if (!esperado) {
      // Si no hay rol esperado, permitir acceso
      return true;
    }
    
    try {
      const rol = (await this.supabase.obtenerRolActual()) as any;
      console.log('Guard de rol - Esperado:', esperado, 'Actual:', rol);
      
      if (rol === esperado) return true;
      
      // Si el rol no coincide, redirigir a la página principal según el rol del usuario
      if (rol === 'empresa') {
        await this.router.navigateByUrl('/pestanas/tab3');
      } else if (rol === 'egresado') {
        await this.router.navigateByUrl('/pestanas/servicios');
      } else {
        await this.router.navigateByUrl('/pestanas/tab1');
      }
      return false;
    } catch (error) {
      console.error('Error en guard de rol:', error);
      // En caso de error, redirigir a feed
      await this.router.navigateByUrl('/pestanas/tab1');
      return false;
    }
  }
}
