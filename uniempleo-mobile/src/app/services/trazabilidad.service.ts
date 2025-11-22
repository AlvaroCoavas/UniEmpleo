import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class ServicioTrazabilidad {
  constructor(private afs: AngularFirestore) {}

  guardarAuditoria(quienId: string, accion: string, referencia: string, detalle?: any) {
    const data = {
      quienId,
      accion,
      referencia,
      detalle: detalle || null,
      cuando: Date.now()
    };
    return this.afs.collection('auditorias').add(data);
  }
}
