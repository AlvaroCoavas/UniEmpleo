import { Component, OnInit } from '@angular/core';
import { ServicioFeed } from '../../services/feed.service';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioNoticias } from '../../services/noticias.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, SearchbarCustomEvent } from '@ionic/angular';
import { VacanteCardComponent } from '../../components/vacante-card/vacante-card.component';
import { NoticiaCardComponent } from '../../components/noticia-card/noticia-card.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { Vacante } from '../../models/vacante';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    RouterModule,
    VacanteCardComponent,
    NoticiaCardComponent,
    EmptyStateComponent,
    LoadingStateComponent
  ]
})
export class PaginaFeed implements OnInit {
  listaNoticiasEmpresas: any[] = [];
  listaVacantes: Vacante[] = [];
  listaVacantesFiltradas: Vacante[] = [];
  cargando: boolean = false;
  terminoBusqueda: string = '';

  constructor(
    private feed: ServicioFeed, 
    private vacantesService: ServicioVacantes, 
    private noticiasService: ServicioNoticias
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      this.listaVacantes = await this.vacantesService.listVacantes();
      this.listaNoticiasEmpresas = await this.noticiasService.listarNoticias();
      this.filtrarVacantes();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async doRefresh(event: any) {
    await this.cargarDatos();
    event.target.complete();
  }

  buscarVacantes(event: SearchbarCustomEvent) {
    this.terminoBusqueda = event.detail.value?.toLowerCase() || '';
    this.filtrarVacantes();
  }

  filtrarVacantes() {
    if (!this.terminoBusqueda.trim()) {
      this.listaVacantesFiltradas = [...this.listaVacantes];
    } else {
      this.listaVacantesFiltradas = this.listaVacantes.filter(vacante => 
        vacante.titulo?.toLowerCase().includes(this.terminoBusqueda) ||
        vacante.descripcion?.toLowerCase().includes(this.terminoBusqueda) ||
        vacante.ubicacion?.toLowerCase().includes(this.terminoBusqueda) ||
        vacante.habilidades?.some(h => h.toLowerCase().includes(this.terminoBusqueda))
      );
    }
  }

  obtenerEmpresaId(noticia: any): string {
    return (noticia as any).empresaIdReal || noticia.empresaId;
  }

  getEmpresaRoute(noticia: any): string[] {
    const empresaId = this.obtenerEmpresaId(noticia);
    return ['/empresa', empresaId];
  }
}
