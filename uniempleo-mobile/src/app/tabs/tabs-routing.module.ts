import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectorSesion } from '../guards/auth.guard';
import { ProtectorRol } from '../guards/role.guard';
import { PaginaPestanas } from './tabs.page';

const routes: Routes = [
  {
    path: 'pestanas',
    component: PaginaPestanas,
    canActivate: [ProtectorSesion],
    children: [
      {
        path: 'tab1',
        loadComponent: () => import('../pages/feed/feed.page').then(m => m.PaginaFeed)
      },
      {
        path: 'tab2',
        loadComponent: () => import('../pages/chat/chat.page').then(m => m.PaginaChat)
      },
      {
        path: 'tab3',
        loadComponent: () => import('../pages/mis-vacantes/mis-vacantes.page').then(m => m.PaginaMisVacantes),
        canActivate: [ProtectorSesion, ProtectorRol],
        data: { role: 'empresa' }
      },
      {
        path: 'servicios',
        loadComponent: () => import('../pages/mis-servicios/mis-servicios.page').then(m => m.PaginaMisServicios),
        canActivate: [ProtectorSesion, ProtectorRol],
        data: { role: 'egresado' }
      },
      {
        path: '',
        redirectTo: '/pestanas/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/pestanas/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
