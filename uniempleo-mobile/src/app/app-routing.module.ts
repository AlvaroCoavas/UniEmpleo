import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'inicio-sesion',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.PaginaLogin),
  },
  {
    path: 'registro-persona',
    loadComponent: () =>
      import('./pages/registro-persona/registro-persona.page').then(
        (m) => m.PaginaRegistroPersona
      ),
  },
  {
    path: 'registro-empresa',
    loadComponent: () =>
      import('./pages/registro-empresa/registro-empresa.page').then(
        (m) => m.PaginaRegistroEmpresa
      ),
  },
  {
    path: 'publicar-vacante',
    loadComponent: () =>
      import('./pages/publicar-vacante/publicar-vacante.page').then(
        (m) => m.PaginaPublicarVacante
      ),
  },
  {
    path: 'mis-vacantes',
    loadComponent: () =>
      import('./pages/mis-vacantes/mis-vacantes.page').then(
        (m) => m.PaginaMisVacantes
      ),
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./pages/feed/feed.page').then((m) => m.PaginaFeed),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat/chat.page').then((m) => m.PaginaChat),
  },
  {
    path: 'perfil-empresa',
    loadComponent: () =>
      import('./pages/perfil-empresa/perfil-empresa.page').then(
        (m) => m.PaginaPerfilEmpresa
      ),
  },
  {
    path: 'publicar-noticia',
    loadComponent: () =>
      import('./pages/publicar-noticia/publicar-noticia.page').then(
        (m) => m.PaginaPublicarNoticia
      ),
  },
  {
    path: 'vacante/:id',
    loadComponent: () =>
      import('./pages/vacante-detalle/vacante-detalle.page').then(
        (m) => m.PaginaVacanteDetalle
      ),
  },
  {
    path: 'empresa/:id',
    loadComponent: () =>
      import('./pages/empresa-detalle/empresa-detalle.page').then(
        (m) => m.PaginaEmpresaDetalle
      ),
  },
  {
    path: 'perfil-egresado',
    loadComponent: () =>
      import('./pages/perfil-egresado/perfil-egresado.page').then(
        (m) => m.PaginaPerfilEgresado
      ),
  },
  {
    path: 'solicitudes',
    loadComponent: () =>
      import('./pages/solicitudes/solicitudes.page').then(
        (m) => m.PaginaSolicitudes
      ),
  },
  {
    path: 'mensajes/:id',
    loadComponent: () =>
      import('./pages/mensajes/mensajes.page').then(
        (m) => m.PaginaMensajes
      ),
  },
  {
    path: 'publicar-servicio',
    loadComponent: () =>
      import('./pages/publicar-servicio/publicar-servicio.page').then(
        (m) => m.PaginaPublicarServicio
      ),
  },
  {
    path: 'solicitudes-persona',
    loadComponent: () =>
      import('./pages/solicitudes-persona/solicitudes-persona.page').then(
        (m) => m.PaginaSolicitudesPersona
      ),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
