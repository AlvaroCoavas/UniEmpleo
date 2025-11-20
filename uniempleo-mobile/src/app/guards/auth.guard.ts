import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({ providedIn: 'root' })
export class ProtectorSesion implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}
  async canActivate() {
    const user = await this.afAuth.currentUser;
    if (user?.uid) return true;
    this.router.navigateByUrl('/inicio-sesion');
    return false;
  }
}