import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';
import { ServicioDatosSupabase } from '../services/supabase.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class PaginaPestanas {
  rol?: 'empresa' | 'egresado';
  constructor(private auth: ServicioAutenticacion, private router: Router, private supabase: ServicioDatosSupabase) {}
  async logout() {
    await this.auth.cerrarSesion();
    this.router.navigateByUrl('/inicio-sesion');
  }
  async ngOnInit() {
    this.rol = (await this.supabase.obtenerRolActual()) as any;
  }
}
