import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-persona',
  templateUrl: './registro-persona.page.html',
  styleUrls: ['./registro-persona.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaRegistroPersona implements OnInit, OnDestroy {
  formulario = this.fb.group({
    nombreCompleto: ['', Validators.required],
    tipoDocumento: ['CC', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9.-]{5,20}$/)]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
    ciudad: ['', Validators.required],
    rolPrincipal: ['', Validators.required],
    experienciaAnios: [0, [Validators.required, Validators.min(0), Validators.max(60)]],
    habilidades: [[] as string[]],
    nuevaHabilidad: [''],
    resumen: [''],
    pretension: [null as number | null],
    disponibilidad: [''],
    aceptaTerminos: [false, Validators.requiredTrue],
  });

  archivoHojaVida?: File;
  archivoFoto?: File;
  habilidadesPorDefecto = ['Diseño', 'Contabilidad', 'Comunicación'];
  habilidadesSugeridasTemporales: string[] = [...this.habilidadesPorDefecto];
  mensajeError: string | null = null;
  estaGuardando: boolean = false;

  constructor(private fb: FormBuilder, private supa: ServicioDatosSupabase, private router: Router, private alertas: AlertController) {}

  ngOnInit() {
    this.habilidadesSugeridasTemporales = [...this.habilidadesPorDefecto];
  }

  ngOnDestroy() {
    this.habilidadesSugeridasTemporales = [...this.habilidadesPorDefecto];
  }

  agregarHabilidad() {
    const nueva = (this.formulario.value.nuevaHabilidad || '').trim();
    if (!nueva) return;
    if (!this.habilidadesSugeridasTemporales.includes(nueva)) {
      this.habilidadesSugeridasTemporales = [...this.habilidadesSugeridasTemporales, nueva];
    }
    this.formulario.patchValue({ nuevaHabilidad: '' });
  }

  toggleHabilidad(hab: string) {
    const lista = this.formulario.value.habilidades as string[];
    if (lista.includes(hab)) {
      this.formulario.patchValue({ habilidades: lista.filter((h) => h !== hab) });
    } else {
      this.formulario.patchValue({ habilidades: [...lista, hab] });
    }
  }

  seleccionarHojaVida(event: any) {
    const f = event.target.files?.[0];
    if (f && f.type === 'application/pdf') this.archivoHojaVida = f;
  }

  seleccionarFoto(event: any) {
    const f = event.target.files?.[0];
    if (f) this.archivoFoto = f;
  }

  async enviar() {
    this.mensajeError = null;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError = 'Revisa los campos marcados en rojo';
      return;
    }
    const v = this.formulario.value;
    let hojaUrl: string | null = null;
    let fotoUrl: string | null = null;
    try {
      this.estaGuardando = true;
      if (this.archivoHojaVida) {
        const ruta = `hojas/${Date.now()}_${this.archivoHojaVida.name}`;
        const sub = await this.supa.subirArchivo('cv', ruta, this.archivoHojaVida);
        if (sub.data?.path) hojaUrl = sub.data.path;
      }
      if (this.archivoFoto) {
        const ruta = `fotos/${Date.now()}_${this.archivoFoto.name}`;
        const sub = await this.supa.subirArchivo('fotos', ruta, this.archivoFoto);
        if (sub.data?.path) fotoUrl = sub.data.path;
      }
      const registro = await this.supa.registrarPersonaNatural({
        nombreCompleto: v.nombreCompleto!,
        tipoDocumento: v.tipoDocumento as any,
        numeroDocumento: v.numeroDocumento!,
        correo: v.correo!,
        contrasena: v.contrasena!,
        telefono: v.telefono!,
        ciudad: v.ciudad!,
        rolPrincipal: v.rolPrincipal!,
        experienciaAnios: Number(v.experienciaAnios || 0),
        habilidades: (v.habilidades as string[]) || [],
        resumen: v.resumen || undefined,
        pretension: v.pretension ?? null,
        disponibilidad: (v.disponibilidad as any) || null,
        urlHojaVida: hojaUrl,
        urlFoto: fotoUrl,
        aceptaTerminos: !!v.aceptaTerminos,
      });
      
      // Redirigir directamente después del registro
      this.router.navigateByUrl('/pestanas/tab1');
    } catch (e: any) {
      const msg = e?.message || 'Error al registrar, revisa los datos.';
      this.mensajeError = msg;
      const alerta = await this.alertas.create({ header: 'Error Supabase', message: String(msg), buttons: ['OK'] });
      await alerta.present();
    }
    finally {
      this.estaGuardando = false;
    }
  }
}
