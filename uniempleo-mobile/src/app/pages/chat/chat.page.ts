import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioChat } from '../../services/chat.service';
import { Mensaje } from '../../models/mensaje';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioVacantes } from '../../services/vacantes.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class PaginaChat implements OnInit, OnDestroy {
  conversaciones: any[] = [];
  mensajes: Mensaje[] = [];
  conversacionSeleccionada?: string;
  texto = '';
  cuentas: any[] = [];
  tipoListado: 'personas' | 'empresas' = 'personas';
  rol?: 'empresa' | 'egresado';
  solicitudesCount: number = 0;
  private solicitudesCh: any;
  constructor(
    private chat: ServicioChat,
    private supabase: ServicioDatosSupabase,
    private vacantes: ServicioVacantes,
    private router: Router
  ) {}
  async ngOnInit() {
    try {
      const u = await this.supabase.cliente.auth.getUser();
      const uid = u.data.user?.id;
      if (uid) this.conversaciones = await this.chat.listarConversaciones(uid);
    } catch {}
    this.rol = (await this.supabase.obtenerRolActual()) as any;
    await this.cargarSolicitudesCount();
    await this.cargarCuentas();
    if (this.rol === 'empresa') {
      this.solicitudesCh = await this.vacantes.suscribirPostulacionesEmpresa(
        async () => {
          await this.cargarSolicitudesCount();
        }
      );
    }
  }
  async abrir(convId: string) {
    this.conversacionSeleccionada = convId;
    this.mensajes = await this.chat.listarMensajes(convId);
  }
  async enviar() {
    if (!this.conversacionSeleccionada) return;
    const u = await this.supabase.cliente.auth.getUser();
    const uid = u.data.user?.id;
    if (!uid) return;
    await this.chat.enviarMensaje(this.conversacionSeleccionada, {
      senderId: uid,
      text: this.texto,
      createdAt: Date.now(),
    });
    this.texto = '';
    this.mensajes = await this.chat.listarMensajes(
      this.conversacionSeleccionada
    );
  }

  async cargarCuentas() {
    this.cuentas = [];
    if (this.rol === 'empresa') {
      const empresa = await this.supabase.obtenerEmpresaActual();
      if (!empresa) {
        this.cuentas = [];
        return;
      }
      const empresaIds = [empresa.id, (empresa as any).auth_user_id].filter(
        Boolean
      );
      const vacs = await this.supabase.cliente
        .from('vacantes')
        .select('id')
        .in('empresa_id', empresaIds as any);
      const vacIds = Array.from(new Set(((vacs.data || []) as any[]).map((v: any) => v.id).filter(Boolean)));
      if (!vacIds.length) { this.cuentas = []; return; }
      const pos = await this.supabase.cliente
        .from('postulaciones')
        .select('persona_id')
        .in('vacante_id', vacIds)
        .eq('estado', 'aceptada');
      const personaIds = Array.from(new Set(((pos.data || []) as any[]).map((p: any) => p.persona_id).filter(Boolean)));
      if (!personaIds.length) { this.cuentas = []; return; }
      const personas = await this.supabase.cliente
        .from('personas')
        .select('id,auth_user_id,nombre_completo,correo,ciudad,telefono,rol_principal,foto_url')
        .in('id', personaIds);
      this.cuentas = (personas.data || []).map((p: any) => ({ ...p, tipo: 'persona' }));
    } else {
      const persona = await this.supabase.obtenerPersonaActual();
      if (!persona?.id) {
        this.cuentas = [];
        return;
      }
      const res = await this.supabase.cliente
        .from('postulaciones')
        .select('id,vacante_id')
        .eq('persona_id', persona.id)
        .eq('estado', 'aceptada');
      const rows = res.data || [];
      const vacIds = Array.from(
        new Set((rows || []).map((r: any) => r.vacante_id).filter(Boolean))
      );
      if (!vacIds.length) {
        this.cuentas = [];
        return;
      }
      const vacs = await this.supabase.cliente
        .from('vacantes')
        .select('id,empresa_id')
        .in('id', vacIds);
      const empIds = Array.from(
        new Set(
          ((vacs.data || []) as any[])
            .map((v: any) => v.empresa_id)
            .filter(Boolean)
        )
      );
      if (!empIds.length) {
        this.cuentas = [];
        return;
      }
      const empRes = await this.supabase.cliente
        .from('empresas')
        .select(
          'id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url'
        )
        .in('id', empIds);
      this.cuentas = (empRes.data || []).map((emp: any) => ({
        ...emp,
        auth_user_id: emp.auth_user_id,
        tipo: 'empresa',
      }));
    }
  }

  async iniciarChatCon(destId: string) {
    const u = await this.supabase.cliente.auth.getUser();
    const uid = u.data.user?.id;
    if (!uid) return;
    const convId = await this.chat.crearConversacion(uid, destId);
    this.conversacionSeleccionada = convId;
    this.mensajes = await this.chat.listarMensajes(convId);
    this.conversaciones = await this.chat.listarConversaciones(uid);
  }

  abrirMensajes(contacto: any) {
    const destino = contacto?.auth_user_id || contacto?.id;
    if (!destino) return;
    this.router.navigate(['/mensajes', destino], {
      state: { contacto },
    });
  }

  async cargarSolicitudesCount() {
    if (this.rol === 'empresa') {
      try {
        this.solicitudesCount =
          await this.vacantes.contarPostulacionesPendientesEmpresa();
      } catch {
        this.solicitudesCount = 0;
      }
    }
  }

  ngOnDestroy() {
    try {
      this.solicitudesCh?.unsubscribe();
    } catch {}
  }
}
