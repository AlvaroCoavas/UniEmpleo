import { Injectable } from '@angular/core';
import { Vacante } from '../models/vacante';
import { ServicioDatosSupabase } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ServicioVacantes {
  constructor(private supa: ServicioDatosSupabase) {}

  async createVacante(v: Vacante) {
    const ins = await this.supa.cliente
      .from('vacantes')
      .insert({
        empresa_id: v.empresaId,
        titulo: v.titulo,
        descripcion: v.descripcion,
        ubicacion: v.ubicacion || null,
        salario: v.salario ?? null,
        modalidad: v.modalidad ?? null,
        requisitos: v.requisitos ?? null,
        estado: v.estado || 'activa',
      })
      .select('id')
      .single();
    const vacanteId = ins.data?.id as string;
    const habilidades = (v.habilidades || []).filter(Boolean);
    if (vacanteId && habilidades.length) {
      const up = await this.supa.cliente.from('habilidades').upsert(
        habilidades.map((h) => ({ nombre: h })),
        { onConflict: 'nombre' }
      );
      if (!up.error) {
        const hs = await this.supa.cliente
          .from('habilidades')
          .select('id,nombre')
          .in('nombre', habilidades);
        const rel = (hs.data || []).map((h: any) => ({ vacante_id: vacanteId, habilidad_id: h.id, requerida: true, peso: 1 }));
        if (rel.length) await this.supa.cliente.from('vacantes_habilidades').upsert(rel, { onConflict: 'vacante_id,habilidad_id' });
      }
    }
    return { id: vacanteId } as any;
  }

  async updateVacante(id: string, patch: Partial<Vacante>) {
    return this.supa.cliente
      .from('vacantes')
      .update({
        titulo: patch.titulo,
        descripcion: patch.descripcion,
        ubicacion: patch.ubicacion,
        salario: patch.salario,
        modalidad: patch.modalidad,
        requisitos: patch.requisitos,
        estado: patch.estado,
      } as any)
      .eq('id', id);
  }

  deleteVacante(id: string) {
    return this.supa.cliente.from('vacantes').delete().eq('id', id);
  }

  async listVacantesByEmpresa(empresaId: string) {
    const res = await this.supa.cliente
      .from('vacantes')
      .select('id,empresa_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en')
      .eq('empresa_id', empresaId)
      .order('creada_en', { ascending: false });
    return (res.data || []).map((d: any) => ({ id: d.id, empresaId: d.empresa_id, titulo: d.titulo, descripcion: d.descripcion, ubicacion: d.ubicacion || '', salario: d.salario ?? undefined, modalidad: d.modalidad ?? undefined, estado: d.estado, createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined } as Vacante));
  }

  async listVacantes() {
    const res = await this.supa.cliente
      .from('vacantes')
      .select('id,empresa_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en')
      .order('creada_en', { ascending: false });
    return (res.data || []).map((d: any) => ({ id: d.id, empresaId: d.empresa_id, titulo: d.titulo, descripcion: d.descripcion, ubicacion: d.ubicacion || '', salario: d.salario ?? undefined, modalidad: d.modalidad ?? undefined, estado: d.estado, createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined } as Vacante));
  }

  async getVacante(id: string) {
    const res = await this.supa.cliente
      .from('vacantes')
      .select('id,empresa_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en')
      .eq('id', id)
      .maybeSingle();
    const d = res.data as any;
    return d ? ({ id: d.id, empresaId: d.empresa_id, titulo: d.titulo, descripcion: d.descripcion, ubicacion: d.ubicacion || '', salario: d.salario ?? undefined, modalidad: d.modalidad ?? undefined, estado: d.estado, createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined } as Vacante) : undefined as any;
  }
}
