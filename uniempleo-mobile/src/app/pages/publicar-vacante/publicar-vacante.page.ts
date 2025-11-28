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
import { ActivatedRoute } from '@angular/router';
import { CurrencyInputDirective } from '../../directives/currency-input.directive';

@Component({
  selector: 'app-publicar-vacante',
  templateUrl: './publicar-vacante.page.html',
  styleUrls: ['./publicar-vacante.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, CurrencyInputDirective],
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
    private supabase: ServicioDatosSupabase,
    private trazas: ServicioTrazabilidad,
    private route: ActivatedRoute
  ) {
    const id = this.route.snapshot.queryParamMap.get('id');
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
    const sesion = await this.supabase.sesionActual();
    const uid = sesion.data.session?.user?.id;
    if (!uid) return;
    const v = {
      empresaId: uid,
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
    if (existenteId) {
      await this.vacantes.updateVacante(existenteId, v);
      await this.trazas.guardarAuditoria(uid, 'editar_vacante', existenteId, { titulo: v.titulo });
    } else {
      const res = await this.vacantes.createVacante(v);
      const idCreado = (res as any).id || '';
      await this.trazas.guardarAuditoria(uid, 'publicar_vacante', idCreado, { titulo: v.titulo });
    }
    this.formulario.reset();
  }
}
