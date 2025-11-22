import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaLogin {
  formularioLogin = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
  });
  mensajeError: string | null = null;
  intentosLogin: number = 0;
  bloqueadoHasta: number = 0;

  constructor(
    private fb: FormBuilder,
    private supabase: ServicioDatosSupabase,
    private router: Router,
    private alertas: AlertController
  ) {}

  ngOnInit() {
    const datoIntentos = localStorage.getItem('intentosLogin');
    const datoBloqueo = localStorage.getItem('bloqueadoHasta');
    this.intentosLogin = datoIntentos ? parseInt(datoIntentos) : 0;
    this.bloqueadoHasta = datoBloqueo ? parseInt(datoBloqueo) : 0;
  }

  estaBloqueado() {
    const ahora = Date.now();
    return this.bloqueadoHasta && ahora < this.bloqueadoHasta;
  }

  async entrar() {
    this.mensajeError = null;
    if (this.estaBloqueado()) {
      this.mensajeError = 'Demasiados intentos. Intenta más tarde.';
      return;
    }
    const { correo, contrasena } = this.formularioLogin.value;
    if (!correo || !contrasena) return;
    try {
      const res = await this.supabase.iniciarSesion(correo!, contrasena!);
      if (res.error) throw res.error;
      this.intentosLogin = 0;
      localStorage.setItem('intentosLogin', String(this.intentosLogin));
      this.router.navigateByUrl('/');
    } catch (e: any) {
      this.intentosLogin++;
      localStorage.setItem('intentosLogin', String(this.intentosLogin));
      if (this.intentosLogin >= 5) {
        const dosMin = 2 * 60 * 1000;
        this.bloqueadoHasta = Date.now() + dosMin;
        localStorage.setItem('bloqueadoHasta', String(this.bloqueadoHasta));
      }
      this.mensajeError = 'Correo o contraseña incorrectos.';
    }
  }

  async recuperarContrasena() {
    const { correo } = this.formularioLogin.value;
    if (!correo) {
      const alerta = await this.alertas.create({
        header: 'Recuperación',
        message: 'Escribe tu correo primero',
        buttons: ['OK'],
      });
      await alerta.present();
      return;
    }
    await this.supabase.enviarCorreoRecuperacion(correo!);
    const alerta = await this.alertas.create({
      header: 'Recuperación',
      message: 'Te enviamos un correo para recuperar tu contraseña',
      buttons: ['OK'],
    });
    await alerta.present();
  }

  irRegistroPersona() {
    this.router.navigateByUrl('/registro-persona');
  }

  irRegistroEmpresa() {
    this.router.navigateByUrl('/registro-empresa');
  }
}
