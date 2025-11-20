import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class PaginaPestanas {
  constructor(private auth: ServicioAutenticacion, private router: Router) {}
  async logout() {
    await this.auth.cerrarSesion();
    this.router.navigateByUrl('/inicio-sesion');
  }
}
