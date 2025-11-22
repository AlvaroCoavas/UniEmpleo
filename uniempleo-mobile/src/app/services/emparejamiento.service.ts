import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vacante } from '../models/vacante';
import { PerfilCandidato } from '../models/perfil-candidato';

@Injectable({ providedIn: 'root' })
export class ServicioEmparejamiento {
  constructor(private afs: AngularFirestore) {}

  calcularPuntaje(v: Vacante, p: PerfilCandidato) {
    const habilidadesVac = (v.habilidades || []).map(x => x.toLowerCase());
    const habilidadesPerf = (p.habilidades || []).map(x => x.toLowerCase());
    const totalHab = habilidadesVac.length || 1;
    const enComun = habilidadesVac.filter(x => habilidadesPerf.includes(x)).length;
    const puntajeHab = enComun / totalHab;

    const dispVac = v.disponibilidad || '';
    const dispPerf = p.disponibilidad || '';
    const puntajeDisp = dispVac && dispPerf ? (dispVac === dispPerf ? 1 : 0.5) : 0.3;

    const modVac = v.modalidad || '';
    const puntajeMod = modVac === 'remoto' ? 1 : 0.7;

    const tarifaVac = v.tarifa || v.salario || 0;
    const tarifaPerf = p.tarifaPreferida || 0;
    const diferencia = Math.abs((tarifaVac || 0) - (tarifaPerf || 0));
    const base = Math.max(tarifaVac || tarifaPerf || 1, 1);
    const puntajeTarifa = base ? Math.max(0, 1 - diferencia / base) : 0.5;

    const wH = 0.4, wD = 0.2, wU = 0.1, wT = 0.3;
    const puntajeUbic = 0.7;
    const puntaje = wH * puntajeHab + wD * puntajeDisp + wU * puntajeUbic + wT * puntajeTarifa;
    return Math.round(puntaje * 100) / 100;
  }

  async obtenerCoincidenciasParaVacante(vacanteId: string) {
    const vacDoc = await this.afs.doc(`vacantes/${vacanteId}`).ref.get();
    const vac = { id: vacDoc.id, ...(vacDoc.data() as any) } as Vacante;
    const perfilesSnap = await this.afs.collection('perfiles_candidato').get().toPromise();
    const perfiles = (perfilesSnap?.docs || []).map(d => ({ id: d.id, ...(d.data() as any) } as PerfilCandidato));
    const lista = perfiles.map(p => ({ perfil: p, puntaje: this.calcularPuntaje(vac, p) }));
    return lista.sort((a, b) => b.puntaje - a.puntaje);
  }
}
