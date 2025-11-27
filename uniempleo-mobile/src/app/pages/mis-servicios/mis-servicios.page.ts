import { Component, OnInit } from '@angular/core';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Vacante } from '../../models/vacante';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-servicios',
  templateUrl: './mis-servicios.page.html',
  styleUrls: ['./mis-servicios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PaginaMisServicios implements OnInit {
  listaServicios: Vacante[] = [];
  solicitudesCount: number = 0;
  
  constructor(
    private vacantesService: ServicioVacantes, 
    private supabase: ServicioDatosSupabase
  ) {}
  
  async ngOnInit() {
    await this.cargarServicios();
    await this.cargarSolicitudesCount();
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
}

