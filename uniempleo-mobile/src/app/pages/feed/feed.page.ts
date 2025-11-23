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
  listaNoticias: any[] = [];
  listaNoticiasEmpresas: any[] = [];
  listaVacantes: any[] = [];
  constructor(private feed: ServicioFeed, private vacantesService: ServicioVacantes, private noticiasService: ServicioNoticias) {}
  async ngOnInit() {
    try {
      this.listaVacantes = await this.vacantesService.listVacantes();
      const data = await this.feed.obtenerFeed().catch(() => ({ items: [] }));
      this.listaNoticias = data.items || [];
      this.listaNoticiasEmpresas = await this.noticiasService.listarNoticias();
    } catch {}
  }
}
