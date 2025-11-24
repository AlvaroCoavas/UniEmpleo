import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioChat } from '../../services/chat.service';
import { Mensaje } from '../../models/mensaje';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './mensajes.page.html',
  styleUrls: ['./mensajes.page.scss'],
})
export class PaginaMensajes implements OnInit, OnDestroy {
  contacto?: any;
  mensajes: Mensaje[] = [];
  texto = '';
  convId?: string;
  rol?: 'empresa' | 'egresado';
  currentUserId?: string;
  cargando = true;
  private channel: any;
  private destinoId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: ServicioDatosSupabase,
    private chat: ServicioChat
  ) {}

  async ngOnInit() {
    this.destinoId = this.route.snapshot.paramMap.get('destId') || undefined;
    if (!this.destinoId) {
      this.router.navigateByUrl('/pestanas/tab2');
      return;
    }
    this.rol = (await this.supabase.obtenerRolActual()) as any;
    const navState = this.router.getCurrentNavigation()?.extras
      ?.state as any;
    if (navState?.contacto) {
      this.contacto = navState.contacto;
    }
    try {
      await this.cargarContacto(this.destinoId);
      await this.prepararConversacion(this.destinoId);
    } catch (error) {
      console.error('No se pudo cargar el chat:', error);
      this.router.navigateByUrl('/pestanas/tab2');
      return;
    } finally {
      this.cargando = false;
    }
  }

  private async cargarContacto(destinoAuthId: string) {
    if (this.contacto?.auth_user_id === destinoAuthId) return;
    if (this.rol === 'empresa') {
      const res = await this.supabase.cliente
        .from('personas')
        .select(
          'id,auth_user_id,nombre_completo,correo,ciudad,telefono,rol_principal,foto_url'
        )
        .eq('auth_user_id', destinoAuthId)
        .maybeSingle();
      if (res.error || !res.data) {
        throw res.error || new Error('No se encontró al postulante');
      }
      this.contacto = {
        ...res.data,
        tipo: 'persona',
      };
    } else {
      const res = await this.supabase.cliente
        .from('empresas')
        .select(
          'id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url'
        )
        .eq('auth_user_id', destinoAuthId)
        .maybeSingle();
      if (res.error || !res.data) {
        throw res.error || new Error('No se encontró la empresa');
      }
      this.contacto = {
        ...res.data,
        tipo: 'empresa',
      };
    }
  }

  private async prepararConversacion(destinoAuthId: string) {
    const usuario = await this.supabase.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    if (!uid) throw new Error('Usuario no autenticado');
    this.currentUserId = uid;
    const convId = await this.chat.crearConversacion(uid, destinoAuthId);
    this.convId = convId;
    await this.cargarMensajes();
    this.channel = await this.chat.suscribirMensajes(convId, (mensaje) => {
      this.mensajes = [...this.mensajes, mensaje];
      this.scrollAlFinal();
    });
  }

  private async cargarMensajes() {
    if (!this.convId) return;
    this.mensajes = await this.chat.listarMensajes(this.convId);
    this.scrollAlFinal();
  }

  async enviar() {
    if (!this.texto.trim() || !this.convId || !this.currentUserId) return;
    const contenido = this.texto.trim();
    this.texto = '';
    await this.chat.enviarMensaje(this.convId, {
      senderId: this.currentUserId,
      text: contenido,
      createdAt: Date.now(),
    });
  }

  inicial(contacto: any) {
    const texto =
      contacto?.nombre_completo ||
      contacto?.razon_social ||
      contacto?.correo ||
      contacto?.correo_corporativo ||
      '';
    return texto ? texto.trim()[0].toUpperCase() : 'U';
  }

  private scrollAlFinal() {
    setTimeout(() => {
      const cont = document.getElementById('mensajesLista');
      cont?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 80);
  }

  ngOnDestroy() {
    try {
      this.channel?.unsubscribe();
    } catch {}
  }
}

