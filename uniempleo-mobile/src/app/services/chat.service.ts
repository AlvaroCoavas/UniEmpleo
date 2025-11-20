import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Conversacion } from '../models/conversacion';
import { Mensaje } from '../models/mensaje';

@Injectable({ providedIn: 'root' })
export class ServicioChat {
  constructor(private afs: AngularFirestore) {}

  async listarConversaciones(uid: string) {
    const snap = await this.afs.collection('conversations', ref => ref.where('participants', 'array-contains', uid).orderBy('lastMessageAt', 'desc')).get().toPromise();
    return (snap?.docs || []).map(d => ({ id: d.id, ...(d.data() as any) } as Conversacion));
  }

  async crearConversacion(a: string, b: string) {
    const ref = await this.afs.collection('conversations').add({ participants: [a, b], lastMessageAt: Date.now() });
    return ref.id;
  }

  async enviarMensaje(convId: string, msg: Omit<Mensaje, 'id'>) {
    await this.afs.collection(`conversations/${convId}/messages`).add(msg);
    await this.afs.doc(`conversations/${convId}`).set({ lastMessageAt: msg.createdAt }, { merge: true });
  }

  async listarMensajes(convId: string) {
    const snap = await this.afs.collection(`conversations/${convId}/messages`, ref => ref.orderBy('createdAt', 'asc')).get().toPromise();
    return (snap?.docs || []).map(d => ({ id: d.id, ...(d.data() as any) } as Mensaje));
  }
}