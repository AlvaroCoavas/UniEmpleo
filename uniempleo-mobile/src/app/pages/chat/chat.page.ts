import { Component, OnInit } from '@angular/core';
import { ServicioChat } from '../../services/chat.service';
import { Mensaje } from '../../models/mensaje';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PaginaChat implements OnInit {
  conversaciones: any[] = [];
  mensajes: Mensaje[] = [];
  conversacionSeleccionada?: string;
  texto = '';
  cuentas: any[] = [];
  tipoListado: 'personas' | 'empresas' = 'personas';
  constructor(private chat: ServicioChat, private supabase: ServicioDatosSupabase) {}
  async ngOnInit() {
    try {
      const u = await this.supabase.cliente.auth.getUser();
      const uid = u.data.user?.id;
      if (uid) this.conversaciones = await this.chat.listarConversaciones(uid);
    } catch {}
    await this.cargarCuentas();
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
    await this.chat.enviarMensaje(this.conversacionSeleccionada, { senderId: uid, text: this.texto, createdAt: Date.now() });
    this.texto = '';
    this.mensajes = await this.chat.listarMensajes(this.conversacionSeleccionada);
  }

  async cargarCuentas() {
    if (this.tipoListado === 'personas') {
      this.cuentas = await this.supabase.listarPersonas(6);
    } else {
      this.cuentas = await this.supabase.listarEmpresas(6);
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
}
