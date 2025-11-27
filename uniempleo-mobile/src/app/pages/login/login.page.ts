import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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
  formularioLogin!: FormGroup;
  mensajeError: string | null = null;
  intentosLogin: number = 0;
  bloqueadoHasta: number = 0;

  constructor(
    private fb: FormBuilder,
    private supabase: ServicioDatosSupabase,
    private router: Router,
    private alertas: AlertController
  ) {
    this.formularioLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

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
      if (res.error) {
        console.error('Error de autenticación:', res.error);
        throw res.error;
      }
      this.intentosLogin = 0;
      localStorage.setItem('intentosLogin', String(this.intentosLogin));
      
      // Esperar un momento para que la sesión se establezca
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const rol = await this.supabase.obtenerRolActual();
      console.log('Rol obtenido:', rol);
      
      if (rol === 'empresa') {
        await this.router.navigateByUrl('/pestanas/tab3');
      } else if (rol === 'egresado') {
        await this.router.navigateByUrl('/pestanas/servicios');
      } else {
        console.warn('Rol no reconocido, redirigiendo a feed');
        await this.router.navigateByUrl('/pestanas/tab1');
      }
    } catch (e: any) {
      console.error('Error en login:', e);
      this.intentosLogin++;
      localStorage.setItem('intentosLogin', String(this.intentosLogin));
      if (this.intentosLogin >= 5) {
        const dosMin = 2 * 60 * 1000;
        this.bloqueadoHasta = Date.now() + dosMin;
        localStorage.setItem('bloqueadoHasta', String(this.bloqueadoHasta));
      }
      this.mensajeError = e?.message || 'Correo o contraseña incorrectos.';
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
