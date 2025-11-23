import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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

  constructor(
    private route: ActivatedRoute,
    private vacantes: ServicioVacantes,
    private supabase: ServicioDatosSupabase
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    if (!id) return;
    this.vacante = await this.vacantes.getVacante(id);
    if (this.vacante?.empresaId) {
      this.empresa = await this.supabase.obtenerEmpresaPorId(this.vacante.empresaId).catch(() => null);
    }
  }
}
