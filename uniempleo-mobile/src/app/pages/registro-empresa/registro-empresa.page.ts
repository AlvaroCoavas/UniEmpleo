import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-empresa',
  templateUrl: './registro-empresa.page.html',
  styleUrls: ['./registro-empresa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaRegistroEmpresa {
  formulario = this.fb.group({
    razonSocial: ['', Validators.required],
    nit: ['', [Validators.required, Validators.pattern(/^\d{7,15}(-\d)?$/)]],
    representante: ['', Validators.required],
    correoCorporativo: ['', [Validators.required, Validators.email, this.validaCorreoCorporativo.bind(this)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
    ciudad: ['', Validators.required],
    sector: ['', Validators.required],
    tamano: ['Mediana', Validators.required],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    sitioWeb: [''],
    descripcion: [''],
    aceptaTerminos: [false, Validators.requiredTrue],
  });

  archivoLogo?: File;
  archivoDocumento?: File;
  sectores = ['Tecnología', 'Manufactura', 'Salud', 'Educación', 'Servicios'];
  tamanoLista = ['Micro', 'Pequena', 'Mediana', 'Grande'];
  mensajeError: string | null = null;
  estaGuardando: boolean = false;

  constructor(private fb: FormBuilder, private supa: ServicioDatosSupabase, private router: Router, private alertas: AlertController) {}

  validaCorreoCorporativo(control: any) {
    const val = String(control.value || '').toLowerCase();
    const dominiosNoPermitidos = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const dominio = val.split('@')[1] || '';
    if (!dominio) return null;
    if (dominiosNoPermitidos.includes(dominio)) return { corporativo: false };
    return null;
  }

  seleccionarLogo(event: any) {
    const f = event.target.files?.[0];
    if (f) this.archivoLogo = f;
  }

  seleccionarDocumento(event: any) {
    const f = event.target.files?.[0];
    if (f) this.archivoDocumento = f;
  }

  async enviar() {
    this.mensajeError = null;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError = 'Revisa los campos marcados en rojo';
      return;
    }
    const v = this.formulario.value;
    let logoUrl: string | null = null;
    let docUrl: string | null = null;
    try {
      this.estaGuardando = true;
      if (this.archivoLogo) {
        const ruta = `logos/${Date.now()}_${this.archivoLogo.name}`;
        const sub = await this.supa.subirArchivo('logos', ruta, this.archivoLogo);
        if (sub.data?.path) logoUrl = sub.data.path;
      }
      if (this.archivoDocumento) {
        const ruta = `verif/${Date.now()}_${this.archivoDocumento.name}`;
        const sub = await this.supa.subirArchivo('verificaciones', ruta, this.archivoDocumento);
        if (sub.data?.path) docUrl = sub.data.path;
      }
      await this.supa.registrarEmpresa({
        razonSocial: v.razonSocial!,
        nit: v.nit!,
        representante: v.representante!,
        correoCorporativo: v.correoCorporativo!,
        telefono: v.telefono!,
        ciudad: v.ciudad!,
        sector: v.sector!,
        tamano: v.tamano as any,
        contrasena: v.contrasena!,
        sitioWeb: v.sitioWeb || null,
        logoUrl: logoUrl,
        docVerificacionUrl: docUrl,
        descripcion: v.descripcion || null,
        aceptaTerminos: !!v.aceptaTerminos,
      });
      this.router.navigateByUrl('/pestanas/tab3');
    } catch (e: any) {
      const msg = e?.message || 'Error al registrar empresa, revisa los datos.';
      this.mensajeError = msg;
      const alerta = await this.alertas.create({ header: 'Error Supabase', message: String(msg), buttons: ['OK'] });
      await alerta.present();
    }
    finally {
      this.estaGuardando = false;
    }
  }
}
