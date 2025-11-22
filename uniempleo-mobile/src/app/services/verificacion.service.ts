import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class ServicioVerificacion {
  constructor(private afs: AngularFirestore) {}

  obtenerEstado(usuarioId: string) {
    return this.afs.doc(`verificaciones/${usuarioId}`).valueChanges();
  }

  async solicitarVerificacion(usuarioId: string, datos?: any) {
    const info = {
      usuarioId,
      estado: 'pendiente',
      solicitadoVerificacionAt: Date.now(),
      verificadoAt: null,
      datos: datos || null,
      documentos: [] as any[]
    };
    await this.afs.doc(`verificaciones/${usuarioId}`).set(info, { merge: true });
    return info;
  }

  async subirDocumento(usuarioId: string, tipo: string, url: string) {
    const doc = { tipo, url, subidoAt: Date.now() };
    await this.afs.doc(`verificaciones/${usuarioId}`).set({ documentos: [doc] }, { merge: true });
    return doc;
  }

  async marcarVerificado(usuarioId: string) {
    await this.afs.doc(`verificaciones/${usuarioId}`).set({ estado: 'verificado', verificadoAt: Date.now() }, { merge: true });
  }
}
