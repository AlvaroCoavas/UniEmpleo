import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioAdmin } from '../services/admin.service';

@Injectable({ providedIn: 'root' })
export class ProtectorAdmin implements CanActivate {
  constructor(
    private router: Router,
    private admin: ServicioAdmin
  ) {}

  async canActivate() {
    console.log('🛡️ Guard de admin ejecutándose...');
    try {
      const esAdmin = await this.admin.esAdministrador();
      console.log('🛡️ Resultado de verificación admin:', esAdmin);
      if (esAdmin) {
        console.log('✅ Guard de admin: Acceso permitido');
        return true;
      }
      // Si no es admin, redirigir a la página principal
      console.log('❌ Guard de admin: Acceso denegado, redirigiendo a tab1');
      await this.router.navigateByUrl('/pestanas/tab1');
      return false;
    } catch (error) {
      console.error('❌ Error en guard de admin:', error);
      await this.router.navigateByUrl('/pestanas/tab1');
      return false;
    }
  }
}

