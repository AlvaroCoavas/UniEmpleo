import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioNoticias, Noticia } from '../../services/noticias.service';

@Component({
  selector: 'app-empresa-detalle',
  templateUrl: './empresa-detalle.page.html',
  styleUrls: ['./empresa-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaginaEmpresaDetalle implements OnInit {
  empresa: any;
  vacantes: any[] = [];
  noticias: Noticia[] = [];

  constructor(private route: ActivatedRoute, private supabase: ServicioDatosSupabase, private vacantesService: ServicioVacantes, private noticiasService: ServicioNoticias) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    if (!id) return;
    this.empresa = await this.supabase.obtenerEmpresaPorId(id).catch(() => null);
    const empresaId = this.empresa?.id || id;
    this.vacantes = await this.vacantesService.listVacantesByEmpresa(empresaId).catch(() => []);
    this.noticias = await this.noticiasService.listarNoticiasPorEmpresa(empresaId).catch(() => []);
  }
}
