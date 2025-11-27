import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioTrazabilidad } from '../../services/trazabilidad.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-publicar-servicio',
  templateUrl: './publicar-servicio.page.html',
  styleUrls: ['./publicar-servicio.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaPublicarServicio {
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

  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private vacantes: ServicioVacantes,
    private supabase: ServicioDatosSupabase,
    private trazas: ServicioTrazabilidad,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = this.route.snapshot.queryParamMap.get('id');
    this.esEdicion = !!id;
    if (id) this.cargar(id);
  }

  async cargar(id: string) {
    const v = await this.vacantes.getVacante(id);
    if (!v) return;
    this.formulario.patchValue({
      titulo: v.titulo,
      descripcion: v.descripcion,
      ubicacion: v.ubicacion || '',
      salario: v.salario?.toString() || '',
      habilidades: (v.habilidades || []).join(', '),
      disponibilidad: v.disponibilidad || '',
      modalidad: v.modalidad || '',
      tarifa: v.tarifa?.toString() || '',
    });
  }

  async enviarFormulario() {
    const persona = await this.supabase.obtenerPersonaActual();
    if (!persona?.id) {
      alert('Debes iniciar sesión como persona para publicar un servicio.');
      return;
    }
    
    const v = {
      personaId: persona.id,
      titulo: this.formulario.value.titulo!,
      descripcion: this.formulario.value.descripcion!,
      ubicacion: this.formulario.value.ubicacion || '',
      salario: this.formulario.value.salario ? Number(this.formulario.value.salario) : undefined,
      habilidades: (this.formulario.value.habilidades || '')
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x),
      disponibilidad: this.formulario.value.disponibilidad || '',
      modalidad: (this.formulario.value.modalidad as any) || undefined,
      tarifa: this.formulario.value.tarifa ? Number(this.formulario.value.tarifa) : undefined,
    };

    const existenteId = this.route.snapshot.queryParamMap.get('id');
    const uid = persona.auth_user_id;
    
    if (existenteId) {
      await this.vacantes.updateVacante(existenteId, v);
      await this.trazas.guardarAuditoria(uid, 'editar_servicio', existenteId, { titulo: v.titulo });
    } else {
      const res = await this.vacantes.createVacante(v);
      const idCreado = (res as any).id || '';
      await this.trazas.guardarAuditoria(uid, 'publicar_servicio', idCreado, { titulo: v.titulo });
    }
    
    this.formulario.reset();
    this.router.navigate(['/pestanas/servicios']);
  }
}

