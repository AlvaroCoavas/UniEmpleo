import { Component, OnInit } from '@angular/core';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Vacante } from '../../models/vacante';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-vacantes',
  templateUrl: './mis-vacantes.page.html',
  styleUrls: ['./mis-vacantes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PaginaMisVacantes implements OnInit {
  listaVacantes: Vacante[] = [];
  constructor(private vacantesService: ServicioVacantes, private supabase: ServicioDatosSupabase) {}
  async ngOnInit() {
    const sesion = await this.supabase.sesionActual();
    const uid = sesion.data.session?.user?.id;
    if (!uid) return;
    this.listaVacantes = await this.vacantesService.listVacantesByEmpresa(uid);
  }

  async eliminar(id: string) {
    await this.vacantesService.deleteVacante(id);
    const uid = (await this.supabase.sesionActual()).data.session?.user?.id;
    if (uid) this.listaVacantes = await this.vacantesService.listVacantesByEmpresa(uid);
  }

  async editar(id: string) {
    // Navega a publicar-vacante con el id para edición
    location.href = `/publicar-vacante?id=${encodeURIComponent(id)}`;
  }
}
