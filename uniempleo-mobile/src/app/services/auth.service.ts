import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Usuario } from '../models/usuario';
import { Empresa } from '../models/empresa';

@Injectable({ providedIn: 'root' })
export class ServicioAutenticacion {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  iniciarSesion(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  cerrarSesion() {
    return this.afAuth.signOut();
  }

  registrarEgresado(nombre: string, email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password).then(async cred => {
      const uid = cred.user?.uid as string;
      const u: Usuario = { uid, nombre, email, role: 'egresado' };
      await this.afs.doc(`usuarios/${uid}`).set(u);
      return cred;
    });
  }

  registrarEmpresa(razonSocial: string, email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password).then(async cred => {
      const uid = cred.user?.uid as string;
      const e: Empresa = { uid, razonSocial, email, role: 'empresa' };
      await this.afs.doc(`empresas/${uid}`).set(e);
      return cred;
    });
  }

  async obtenerRolUsuario(uid: string) {
    const u = await this.afs.doc<Usuario>(`usuarios/${uid}`).ref.get();
    const e = await this.afs.doc<Empresa>(`empresas/${uid}`).ref.get();
    if (u.exists) return (u.data() as Usuario).role;
    if (e.exists) return (e.data() as Empresa).role;
    return undefined;
  }

  get usuarioActual() {
    return this.afAuth.currentUser;
  }
}