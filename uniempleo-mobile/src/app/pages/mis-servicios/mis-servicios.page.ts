import { Component, OnInit } from '@angular/core';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Vacante } from '../../models/vacante';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-mis-servicios',
  templateUrl: './mis-servicios.page.html',
  styleUrls: ['./mis-servicios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, CurrencyFormatPipe]
})
export class PaginaMisServicios implements OnInit {
  listaServicios: Vacante[] = [];
  solicitudesCount: number = 0;
  tieneSuscripcion: boolean = false;
  
  constructor(
    private vacantesService: ServicioVacantes, 
    private supabase: ServicioDatosSupabase,
    private router: Router
  ) {}
  
  async ngOnInit() {
    await this.verificarSuscripcion();
    await this.cargarServicios();
    await this.cargarSolicitudesCount();
  }

  async verificarSuscripcion() {
    const persona = await this.supabase.obtenerPersonaActual();
    if (persona) {
      this.tieneSuscripcion = persona.suscripcion === true;
    }
  }

  async publicarServicio() {
    // Verificar suscripción antes de permitir publicar
    await this.verificarSuscripcion();
    
    if (!this.tieneSuscripcion) {
      // Redirigir a página de suscripción
      this.router.navigate(['/suscripcion'], {
        queryParams: { redirect: '/publicar-servicio' }
      });
    } else {
      // Si tiene suscripción, permitir publicar
      this.router.navigate(['/publicar-servicio']);
    }
  }

  async cargarServicios() {
    const persona = await this.supabase.obtenerPersonaActual();
    if (!persona?.id) return;
    this.listaServicios = await this.vacantesService.listVacantesByPersona(persona.id);
  }

  async cargarSolicitudesCount() {
    try {
      this.solicitudesCount = await this.vacantesService.contarPostulacionesPendientesPersona();
    } catch {
      this.solicitudesCount = 0;
    }
  }

  async eliminar(id: string) {
    await this.vacantesService.deleteVacante(id);
    await this.cargarServicios();
  }

  async editar(id: string) {
    // Navega a publicar-servicio con el id para edición
    location.href = `/publicar-servicio?id=${encodeURIComponent(id)}`;
  }

  async doRefresh(event: any) {
    await this.ngOnInit();
    event.target.complete();
  }
}

