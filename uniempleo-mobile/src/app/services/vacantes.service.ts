import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vacante } from '../models/vacante';

@Injectable({ providedIn: 'root' })
export class ServicioVacantes {
  constructor(private afs: AngularFirestore) {}

  async createVacante(v: Vacante) {
    return this.afs.collection('vacantes').add({ ...v, createdAt: Date.now(), estado: v.estado || 'activa' });
  }

  updateVacante(id: string, patch: Partial<Vacante>) {
    return this.afs.doc(`vacantes/${id}`).update(patch);
  }

  deleteVacante(id: string) {
    return this.afs.doc(`vacantes/${id}`).delete();
  }

  async listVacantesByEmpresa(empresaId: string) {
    const snap = await this.afs.collection('vacantes', ref => ref.where('empresaId', '==', empresaId).orderBy('createdAt', 'desc')).get().toPromise();
    return (snap?.docs || []).map(d => ({ id: d.id, ...(d.data() as any) } as Vacante));
  }

  async listVacantes() {
    const snap = await this.afs.collection('vacantes', ref => ref.orderBy('createdAt', 'desc')).get().toPromise();
    return (snap?.docs || []).map(d => ({ id: d.id, ...(d.data() as any) } as Vacante));
  }
}