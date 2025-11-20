import { Injectable, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ServicioAutenticacion } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ProtectorRol implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router, @Inject(ServicioAutenticacion) private authService: ServicioAutenticacion) {}
  async canActivate(route: any) {
    const expected: 'empresa' | 'egresado' = route.data?.role;
    const user = await this.afAuth.currentUser;
    if (!user?.uid) {
      this.router.navigateByUrl('/inicio-sesion');
      return false;
    }
    const role = await this.authService.obtenerRolUsuario(user.uid);
    if (role === expected) return true;
    this.router.navigateByUrl('/');
    return false;
  }
}