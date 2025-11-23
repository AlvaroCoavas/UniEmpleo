import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil-egresado',
  templateUrl: './perfil-egresado.page.html',
  styleUrls: ['./perfil-egresado.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class PaginaPerfilEgresado implements OnInit {
  persona: any | undefined;
  correo: string | undefined;
  formulario!: FormGroup;
  guardando = false;
  mensajeError: string | null = null;

  constructor(private supabase: ServicioDatosSupabase, private alertas: AlertController, private fb: FormBuilder) {
    this.formulario = this.fb.group({
      nombre_completo: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      rol_principal: ['', [Validators.required]],
      anos_experiencia: [0, [Validators.min(0)]],
      disponibilidad: [''],
      resumen: [''],
    });
  }

  async ngOnInit() {
    const u = await this.supabase.cliente.auth.getUser();
    this.correo = u.data.user?.email || undefined;
    this.persona = await this.supabase.obtenerPersonaActual().catch(() => undefined);
    if (this.persona) {
      this.formulario.patchValue({
        nombre_completo: this.persona.nombre_completo || '',
        ciudad: this.persona.ciudad || '',
        rol_principal: this.persona.rol_principal || '',
        anos_experiencia: this.persona.anos_experiencia || 0,
        disponibilidad: this.persona.disponibilidad || '',
        resumen: this.persona.resumen || '',
      });
    }
  }

  async cambiarContrasena() {
    if (!this.correo) return;
    await this.supabase.enviarCorreoRecuperacion(this.correo);
    const alerta = await this.alertas.create({ header: 'Recuperación', message: 'Te enviamos un correo para cambiar la contraseña', buttons: ['OK'] });
    await alerta.present();
  }

  async guardar() {
    if (!this.formulario.valid) return;
    this.mensajeError = null;
    this.guardando = true;
    try {
      const datos = this.formulario.value as any;
      await this.supabase.actualizarPersonaActual({
        nombre_completo: datos.nombre_completo,
        ciudad: datos.ciudad,
        rol_principal: datos.rol_principal,
        anos_experiencia: Number(datos.anos_experiencia || 0),
        disponibilidad: datos.disponibilidad,
        resumen: datos.resumen,
      });
      this.persona = await this.supabase.obtenerPersonaActual().catch(() => this.persona);
      const alerta = await this.alertas.create({ header: 'Guardado', message: 'Tu perfil se actualizó correctamente', buttons: ['OK'] });
      await alerta.present();
      this.formulario.markAsPristine();
    } catch (e: any) {
      this.mensajeError = e?.message || 'No fue posible actualizar el perfil';
    } finally {
      this.guardando = false;
    }
  }
}
