import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioDatosSupabase } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class ProtectorSesion implements CanActivate {
  constructor(
    private router: Router,
    private supabase: ServicioDatosSupabase
  ) {}
  async canActivate() {
    try {
      const sesion = await this.supabase.sesionActual();
      if (sesion.data.session?.user?.id) {
        return true;
      }
      console.log('No hay sesión activa, redirigiendo a login');
      await this.router.navigateByUrl('/inicio-sesion');
      return false;
    } catch (error) {
      console.error('Error en guard de autenticación:', error);
      await this.router.navigateByUrl('/inicio-sesion');
      return false;
    }
  }
}
