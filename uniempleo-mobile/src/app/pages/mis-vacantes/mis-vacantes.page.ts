import { Component, OnInit } from '@angular/core';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioNoticias } from '../../services/noticias.service';
import { Noticia } from '../../services/noticias.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Vacante } from '../../models/vacante';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-mis-vacantes',
  templateUrl: './mis-vacantes.page.html',
  styleUrls: ['./mis-vacantes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PaginaMisVacantes implements OnInit {
  listaVacantes: Vacante[] = [];
  tieneSuscripcion: boolean = false;
  noticiasPublicadas: Noticia[] = [];

  constructor(
    private vacantesService: ServicioVacantes,
    private supabase: ServicioDatosSupabase,
    private noticiasService: ServicioNoticias,
    private router: Router,
    private alertas: AlertController
  ) {}

  async ngOnInit() {
    const sesion = await this.supabase.sesionActual();
    const uid = sesion.data.session?.user?.id;
    if (!uid) return;
    
    // Verificar suscripción
    await this.verificarSuscripcion();
    
    this.listaVacantes = await this.vacantesService.listVacantesByEmpresa(uid);
    this.noticiasPublicadas = await this.noticiasService.listarNoticiasPorEmpresa(uid);
  }

  async verificarSuscripcion() {
    const empresa = await this.supabase.obtenerEmpresaActual();
    if (empresa) {
      this.tieneSuscripcion = empresa.suscripcion === true;
    }
  }

  async publicarVacante() {
    // Verificar suscripción antes de permitir publicar
    await this.verificarSuscripcion();
    
    if (!this.tieneSuscripcion) {
      // Redirigir a página de suscripción
      this.router.navigate(['/suscripcion'], {
        queryParams: { redirect: '/publicar-vacante' }
      });
    } else {
      // Si tiene suscripción, permitir publicar
      this.router.navigate(['/publicar-vacante']);
    }
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

  async doRefresh(event: any) {
    await this.ngOnInit();
    event.target.complete();
  }
}
