import { Component } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicioVacantes } from '../../services/vacantes.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-publicar-vacante',
  templateUrl: './publicar-vacante.page.html',
  styleUrls: ['./publicar-vacante.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class PaginaPublicarVacante {
  formulario = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    ubicacion: [''],
    salario: ['']
  });

  constructor(private fb: FormBuilder, private vacantes: ServicioVacantes, private afAuth: AngularFireAuth) {}

  async enviarFormulario() {
    const user = await this.afAuth.currentUser;
    if (!user?.uid) return;
    const v = {
      empresaId: user.uid,
      titulo: this.formulario.value.titulo!,
      descripcion: this.formulario.value.descripcion!,
      ubicacion: this.formulario.value.ubicacion || '',
      salario: this.formulario.value.salario ? Number(this.formulario.value.salario) : undefined
    };
    await this.vacantes.createVacante(v);
    this.formulario.reset();
  }
}