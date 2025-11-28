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
import { ServicioAdmin } from '../../services/admin.service';

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
    private alertas: AlertController,
    private admin: ServicioAdmin
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
      
      // Verificar si es administrador primero
      const esAdmin = await this.admin.esAdministrador();
      if (esAdmin) {
        await this.router.navigateByUrl('/admin');
        return;
      }
      
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
    
    try {
      // Obtener la URL base de la aplicación
      const siteUrl = window.location.origin;
      const redirectUrl = `${siteUrl}/recuperar-contrasena`;
      
      const { error } = await this.supabase.cliente.auth.resetPasswordForEmail(correo!, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        // Si el error es de SMTP, mostrar mensaje más claro
        if (error.message?.includes('Error sending recovery email') || error.message?.includes('535') || error.message?.includes('BadCredentials')) {
          const alerta = await this.alertas.create({
            header: 'Error de Configuración',
            message: 'El servicio de correo electrónico no está configurado correctamente en el servidor. Por favor, contacta al administrador del sistema para que configure el servicio SMTP. El correo no se pudo enviar debido a un problema de configuración del servidor.',
            buttons: ['OK'],
          });
          await alerta.present();
          return;
        }
        throw error;
      }
      
      const alerta = await this.alertas.create({
        header: 'Correo enviado',
        message: 'Te enviamos un correo para recuperar tu contraseña. Revisa tu bandeja de entrada (incluye la carpeta de spam).',
        buttons: ['OK'],
      });
      await alerta.present();
    } catch (error: any) {
      console.error('Error al enviar correo de recuperación:', error);
      let mensajeError = 'No se pudo enviar el correo de recuperación.';
      let tituloError = 'Error';
      
      // Mensajes más específicos según el error
      if (error?.message?.includes('535') || error?.message?.includes('BadCredentials') || error?.message?.includes('Error sending recovery email')) {
        tituloError = 'Error de Configuración SMTP';
        mensajeError = 'El servidor de correo no está configurado correctamente. Por favor, contacta al administrador del sistema para que configure el servicio de correo electrónico.';
      } else if (error?.message?.includes('email') || error?.message?.includes('not found') || error?.message?.includes('no existe')) {
        tituloError = 'Correo no encontrado';
        mensajeError = 'El correo ingresado no está registrado en el sistema. Verifica que hayas escrito correctamente tu correo electrónico.';
      } else if (error?.message) {
        mensajeError = error.message;
      }
      
      const alerta = await this.alertas.create({
        header: tituloError,
        message: mensajeError,
        buttons: ['OK'],
      });
      await alerta.present();
    }
  }

  irRegistroPersona() {
    this.router.navigateByUrl('/registro-persona');
  }

  irRegistroEmpresa() {
    this.router.navigateByUrl('/registro-empresa');
  }
}
