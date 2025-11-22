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
    const rol = (await this.supabase.obtenerRolActual()) as any;
    if (rol === esperado) return true;
    this.router.navigateByUrl('/');
    return false;
  }
}
