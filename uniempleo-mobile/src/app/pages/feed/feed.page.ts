import { Component, OnInit } from '@angular/core';
import { ServicioFeed } from '../../services/feed.service';
import { ServicioVacantes } from '../../services/vacantes.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PaginaFeed implements OnInit {
  listaNoticias: any[] = [];
  listaVacantes: any[] = [];
  constructor(private feed: ServicioFeed, private vacantesService: ServicioVacantes) {}
  async ngOnInit() {
    try {
      this.listaVacantes = await this.vacantesService.listVacantes();
      const data = await this.feed.obtenerFeed().catch(() => ({ items: [] }));
      this.listaNoticias = data.items || [];
    } catch {}
  }
}