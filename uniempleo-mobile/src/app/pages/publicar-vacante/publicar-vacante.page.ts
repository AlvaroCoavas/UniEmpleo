import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioTrazabilidad } from '../../services/trazabilidad.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-publicar-vacante',
  templateUrl: './publicar-vacante.page.html',
  styleUrls: ['./publicar-vacante.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaPublicarVacante {
  formulario = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    ubicacion: [''],
    salario: [''],
    habilidades: [''],
    disponibilidad: [''],
    modalidad: [''],
    tarifa: [''],
  });

  constructor(
    private fb: FormBuilder,
    private vacantes: ServicioVacantes,
    private afAuth: AngularFireAuth,
    private trazas: ServicioTrazabilidad
  ) {}

  async enviarFormulario() {
    const user = await this.afAuth.currentUser;
    if (!user?.uid) return;
    const v = {
      empresaId: user.uid,
      titulo: this.formulario.value.titulo!,
      descripcion: this.formulario.value.descripcion!,
      ubicacion: this.formulario.value.ubicacion || '',
      salario: this.formulario.value.salario
        ? Number(this.formulario.value.salario)
        : undefined,
      habilidades: (this.formulario.value.habilidades || '')
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x),
      disponibilidad: this.formulario.value.disponibilidad || '',
      modalidad: (this.formulario.value.modalidad as any) || undefined,
      tarifa: this.formulario.value.tarifa
        ? Number(this.formulario.value.tarifa)
        : undefined,
    };
    const res = await this.vacantes.createVacante(v);
    await this.trazas.guardarAuditoria(
      user.uid,
      'publicar_vacante',
      res.id || '',
      { titulo: v.titulo }
    );
    this.formulario.reset();
  }
}
