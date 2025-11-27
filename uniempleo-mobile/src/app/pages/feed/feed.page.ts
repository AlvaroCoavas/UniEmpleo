import { Component, OnInit } from '@angular/core';
import { ServicioFeed } from '../../services/feed.service';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioNoticias } from '../../services/noticias.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PaginaFeed implements OnInit {
  listaNoticiasEmpresas: any[] = [];
  listaVacantes: any[] = [];
  constructor(private feed: ServicioFeed, private vacantesService: ServicioVacantes, private noticiasService: ServicioNoticias) {}
  async ngOnInit() {
    try {
      this.listaVacantes = await this.vacantesService.listVacantes();
      this.listaNoticiasEmpresas = await this.noticiasService.listarNoticias();
    } catch {}
  }


  obtenerEmpresaId(noticia: any): string {
    return (noticia as any).empresaIdReal || noticia.empresaId;
  }

  getEmpresaRoute(noticia: any): string[] {
    const empresaId = this.obtenerEmpresaId(noticia);
    return ['/empresa', empresaId];
  }
}
