import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-vacante-detalle',
  templateUrl: './vacante-detalle.page.html',
  styleUrls: ['./vacante-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaginaVacanteDetalle implements OnInit {
  vacante: any;
  empresa: any;
  estaPostulando: boolean = false;
  yaPostulado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private vacantes: ServicioVacantes,
    private supabase: ServicioDatosSupabase,
    private alertas: AlertController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    if (!id) return;
    this.vacante = await this.vacantes.getVacante(id);
    if (this.vacante?.empresaId) {
      this.empresa = await this.supabase
        .obtenerEmpresaPorId(this.vacante.empresaId)
        .catch(() => null);
    }
    if (this.vacante?.id) {
      this.yaPostulado = await this.vacantes
        .yaPostulado(this.vacante.id)
        .catch(() => false);
    }
  }

  async postularme() {
    if (!this.vacante?.id) return;
    this.estaPostulando = true;
    try {
      await this.vacantes.postularVacante(this.vacante.id);
      const alerta = await this.alertas.create({
        header: 'Postulación',
        message: 'Tu postulación fue registrada.',
        buttons: ['OK'],
      });
      await alerta.present();
      this.yaPostulado = true;
    } catch (e: any) {
      const msg = e?.message || 'No se pudo registrar la postulación.';
      const alerta = await this.alertas.create({
        header: 'Error',
        message: String(msg),
        buttons: ['OK'],
      });
      await alerta.present();
    } finally {
      this.estaPostulando = false;
    }
  }
}
