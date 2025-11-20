import { Component } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicioAutenticacion } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class PaginaLogin {
  formularioLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  formularioEgresado = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  formularioEmpresa = this.fb.group({
    razonSocial: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  modo: 'login' | 'egresado' | 'empresa' = 'login';

  constructor(private fb: FormBuilder, private auth: ServicioAutenticacion, private router: Router) {}

  async entrar() {
    const { email, password } = this.formularioLogin.value;
    if (!email || !password) return;
    await this.auth.iniciarSesion(email, password);
    this.router.navigateByUrl('/');
  }

  async registrarEgresado() {
    const { nombre, email, password } = this.formularioEgresado.value;
    if (!nombre || !email || !password) return;
    await this.auth.registrarEgresado(nombre!, email!, password!);
    this.router.navigateByUrl('/');
  }

  async registrarEmpresa() {
    const { razonSocial, email, password } = this.formularioEmpresa.value;
    if (!razonSocial || !email || !password) return;
    await this.auth.registrarEmpresa(razonSocial!, email!, password!);
    this.router.navigateByUrl('/');
  }
}