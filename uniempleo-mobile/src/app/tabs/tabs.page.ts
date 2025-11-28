import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ServicioAutenticacion } from '../services/auth.service';
import { ServicioDatosSupabase } from '../services/supabase.service';
import { ServicioVacantes } from '../services/vacantes.service';
import { ServicioChat } from '../services/chat.service';
import { ServicioAdmin } from '../services/admin.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class PaginaPestanas implements OnInit, OnDestroy {
  rol?: 'empresa' | 'egresado';
  solicitudesCount: number = 0;
  mensajesNoLeidosCount: number = 0;
  esAdmin: boolean = false;
  private ch: any;
  private mensajesCh: any;
  private intervaloMensajes: any;
  constructor(
    private auth: ServicioAutenticacion,
    private router: Router,
    private supabase: ServicioDatosSupabase,
    private vacantes: ServicioVacantes,
    private chat: ServicioChat,
    private admin: ServicioAdmin,
    private menu: MenuController
  ) {}
  async logout() {
    await this.auth.cerrarSesion();
    this.router.navigateByUrl('/inicio-sesion');
  }

  async cerrarMenu() {
    await this.menu.close('menuPrincipal');
  }
  async ngOnInit() {
    this.rol = (await this.supabase.obtenerRolActual()) as any;
    this.esAdmin = await this.admin.esAdministrador();
    if (this.rol === 'empresa') {
      try {
        this.solicitudesCount =
          await this.vacantes.contarPostulacionesPendientesEmpresa();
      } catch {
        this.solicitudesCount = 0;
      }
      this.ch = await this.vacantes.suscribirPostulacionesEmpresa(async () => {
        try {
          this.solicitudesCount =
            await this.vacantes.contarPostulacionesPendientesEmpresa();
        } catch {
          this.solicitudesCount = 0;
        }
      });
    } else if (this.rol === 'egresado') {
      try {
        this.solicitudesCount =
          await this.vacantes.contarPostulacionesPendientesPersona();
      } catch {
        this.solicitudesCount = 0;
      }
      this.ch = await this.vacantes.suscribirPostulacionesPersona(async () => {
        try {
          this.solicitudesCount =
            await this.vacantes.contarPostulacionesPendientesPersona();
        } catch {
          this.solicitudesCount = 0;
        }
      });
    }

    // Cargar y suscribir a mensajes no leídos
    await this.cargarMensajesNoLeidos();
    this.suscribirMensajesNoLeidos();
    
    // Actualizar cada 30 segundos
    this.intervaloMensajes = setInterval(async () => {
      await this.cargarMensajesNoLeidos();
    }, 30000);
  }

  async cargarMensajesNoLeidos() {
    try {
      const usuario = await this.supabase.cliente.auth.getUser();
      const uid = usuario.data.user?.id;
      if (uid) {
        this.mensajesNoLeidosCount = await this.chat.contarMensajesNoLeidos(uid);
      }
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error);
      this.mensajesNoLeidosCount = 0;
    }
  }

  suscribirMensajesNoLeidos() {
    try {
      const channel = this.supabase.cliente.channel('mensajes_no_leidos');
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes',
          },
          () => {
            // Actualizar inmediatamente sin bloquear
            this.cargarMensajesNoLeidos().catch(err => 
              console.error('Error al actualizar mensajes no leídos:', err)
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes_leidos',
          },
          () => {
            // También actualizar cuando se marcan mensajes como leídos
            this.cargarMensajesNoLeidos().catch(err => 
              console.error('Error al actualizar mensajes no leídos:', err)
            );
          }
        )
        .subscribe();
      this.mensajesCh = channel;
    } catch (error) {
      console.error('Error al suscribirse a mensajes:', error);
    }
  }

  ngOnDestroy() {
    try {
      this.ch?.unsubscribe();
      this.mensajesCh?.unsubscribe();
      if (this.intervaloMensajes) {
        clearInterval(this.intervaloMensajes);
      }
    } catch {}
  }
}
