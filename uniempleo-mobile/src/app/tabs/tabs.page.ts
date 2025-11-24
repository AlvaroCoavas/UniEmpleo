import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';
import { ServicioDatosSupabase } from '../services/supabase.service';
import { ServicioVacantes } from '../services/vacantes.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class PaginaPestanas implements OnDestroy {
  rol?: 'empresa' | 'egresado';
  solicitudesCount: number = 0;
  private ch: any;
  constructor(
    private auth: ServicioAutenticacion,
    private router: Router,
    private supabase: ServicioDatosSupabase,
    private vacantes: ServicioVacantes
  ) {}
  async logout() {
    await this.auth.cerrarSesion();
    this.router.navigateByUrl('/inicio-sesion');
  }
  async ngOnInit() {
    this.rol = (await this.supabase.obtenerRolActual()) as any;
    if (this.rol === 'empresa') {
      try {
        this.solicitudesCount =
          await this.vacantes.contarPostulacionesPendientesEmpresa();
      } catch {
        this.solicitudesCount = 0;
      }
      this.ch = await this.vacantes.suscribirPostulacionesEmpresa(async () => {
        try {
          this.solicitudesCount =
            await this.vacantes.contarPostulacionesPendientesEmpresa();
        } catch {
          this.solicitudesCount = 0;
        }
      });
    }
  }

  ngOnDestroy() {
    try {
      this.ch?.unsubscribe();
    } catch {}
  }
}
