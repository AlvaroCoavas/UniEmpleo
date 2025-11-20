import { Component, OnInit } from '@angular/core';
import { ServicioVacantes } from '../../services/vacantes.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Vacante } from '../../models/vacante';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-mis-vacantes',
  templateUrl: './mis-vacantes.page.html',
  styleUrls: ['./mis-vacantes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PaginaMisVacantes implements OnInit {
  listaVacantes: Vacante[] = [];
  constructor(private vacantesService: ServicioVacantes, private afAuth: AngularFireAuth) {}
  async ngOnInit() {
    const user = await this.afAuth.currentUser;
    const uid = user?.uid;
    if (!uid) return;
    this.listaVacantes = await this.vacantesService.listVacantesByEmpresa(uid);
  }
}