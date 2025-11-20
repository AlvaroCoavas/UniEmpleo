import { Component, OnInit } from '@angular/core';
import { ServicioChat } from '../../services/chat.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Mensaje } from '../../models/mensaje';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

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
  constructor(private chat: ServicioChat, private afAuth: AngularFireAuth) {}
  async ngOnInit() {
    const user = await this.afAuth.currentUser;
    const uid = user?.uid;
    if (!uid) return;
    this.conversaciones = await this.chat.listarConversaciones(uid);
  }
  async abrir(convId: string) {
    this.conversacionSeleccionada = convId;
    this.mensajes = await this.chat.listarMensajes(convId);
  }
  async enviar() {
    if (!this.conversacionSeleccionada) return;
    const user = await this.afAuth.currentUser;
    const uid = user?.uid;
    if (!uid) return;
    await this.chat.enviarMensaje(this.conversacionSeleccionada, { senderId: uid, text: this.texto, createdAt: Date.now() });
    this.texto = '';
    this.mensajes = await this.chat.listarMensajes(this.conversacionSeleccionada);
  }
}