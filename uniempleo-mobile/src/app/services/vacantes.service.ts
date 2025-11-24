import { Injectable } from '@angular/core';
import { Vacante } from '../models/vacante';
import { ServicioDatosSupabase } from './supabase.service';
import { ServicioChat } from './chat.service';

@Injectable({ providedIn: 'root' })
export class ServicioVacantes {
  constructor(
    private supa: ServicioDatosSupabase,
    private chat: ServicioChat
  ) {}

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
        const rel = (hs.data || []).map((h: any) => ({
          vacante_id: vacanteId,
          habilidad_id: h.id,
          requerida: true,
          peso: 1,
        }));
        if (rel.length)
          await this.supa.cliente
            .from('vacantes_habilidades')
            .upsert(rel, { onConflict: 'vacante_id,habilidad_id' });
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
      .select(
        'id,empresa_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en'
      )
      .eq('empresa_id', empresaId)
      .order('creada_en', { ascending: false });
    return (res.data || []).map(
      (d: any) =>
        ({
          id: d.id,
          empresaId: d.empresa_id,
          titulo: d.titulo,
          descripcion: d.descripcion,
          ubicacion: d.ubicacion || '',
          salario: d.salario ?? undefined,
          modalidad: d.modalidad ?? undefined,
          estado: d.estado,
          createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined,
        } as Vacante)
    );
  }

  async listVacantes() {
    const res = await this.supa.cliente
      .from('vacantes')
      .select(
        'id,empresa_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en'
      )
      .order('creada_en', { ascending: false });
    return (res.data || []).map(
      (d: any) =>
        ({
          id: d.id,
          empresaId: d.empresa_id,
          titulo: d.titulo,
          descripcion: d.descripcion,
          ubicacion: d.ubicacion || '',
          salario: d.salario ?? undefined,
          modalidad: d.modalidad ?? undefined,
          estado: d.estado,
          createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined,
        } as Vacante)
    );
  }

  async getVacante(id: string) {
    const res = await this.supa.cliente
      .from('vacantes')
      .select(
        'id,empresa_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en'
      )
      .eq('id', id)
      .maybeSingle();
    const d = res.data as any;
    return d
      ? ({
          id: d.id,
          empresaId: d.empresa_id,
          titulo: d.titulo,
          descripcion: d.descripcion,
          ubicacion: d.ubicacion || '',
          salario: d.salario ?? undefined,
          modalidad: d.modalidad ?? undefined,
          estado: d.estado,
          createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined,
        } as Vacante)
      : (undefined as any);
  }

  async postularVacante(vacanteId: string) {
    const persona = await this.supa.obtenerPersonaActual();
    if (!persona?.id)
      throw new Error('Debes iniciar sesión como egresado para postularte.');
    const existente = await this.supa.cliente
      .from('postulaciones')
      .select('id,estado')
      .eq('vacante_id', vacanteId)
      .eq('persona_id', persona.id)
      .maybeSingle();
    if (existente.data?.id) throw new Error('Ya te postulaste a esta vacante.');
    const ins = await this.supa.cliente
      .from('postulaciones')
      .insert({
        vacante_id: vacanteId,
        persona_id: persona.id,
        estado: 'creada',
      })
      .select('id')
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return ins.data?.id as string;
  }

  async yaPostulado(vacanteId: string) {
    const persona = await this.supa.obtenerPersonaActual();
    if (!persona?.id) return false;
    const res = await this.supa.cliente
      .from('postulaciones')
      .select('id,estado')
      .eq('vacante_id', vacanteId)
      .eq('persona_id', persona.id)
      .maybeSingle();
    const r = res.data as any;
    if (!r?.id) return false;
    return r.estado !== 'rechazada';
  }

  async listarPostulacionesPendientesEmpresa() {
    const empresa = await this.supa.obtenerEmpresaActual();
    if (!empresa) return [] as any[];
    const empresaIds = [empresa.id, (empresa as any).auth_user_id].filter(
      Boolean
    );

    const vacs = await this.supa.cliente
      .from('vacantes')
      .select('id,titulo,empresa_id')
      .in('empresa_id', empresaIds as any);

    if (vacs.error) {
      console.error('Error al obtener vacantes:', vacs.error);
      return [] as any[];
    }

    const ids = (vacs.data || []).map((v: any) => v.id);
    if (ids.length === 0) return [] as any[];

    let res = await this.supa.cliente
      .from('postulaciones')
      .select(
        'id,estado,creada_en,persona_id,vacante_id, personas(id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,hoja_vida_url), vacantes(id,titulo,empresa_id)'
      )
      .in('vacante_id', ids)
      .eq('estado', 'creada');

    if (res.error || !res.data) {
      console.warn('Join falló, usando consultas separadas:', res.error);
      const resSimple = await this.supa.cliente
        .from('postulaciones')
        .select('id,estado,creada_en,persona_id,vacante_id')
        .in('vacante_id', ids)
        .eq('estado', 'creada');

      if (resSimple.error || !resSimple.data || resSimple.data.length === 0) {
        return [] as any[];
      }

      const rows = resSimple.data as any[];
      const personaIds = [
        ...new Set(rows.map((r: any) => r.persona_id).filter(Boolean)),
      ];
      const vacanteIds = [
        ...new Set(rows.map((r: any) => r.vacante_id).filter(Boolean)),
      ];

      let personasById: any = {};
      let vacantesById: any = {};

      if (personaIds.length > 0) {
        const personasRes = await this.supa.cliente
          .from('personas')
          .select(
            'id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,hoja_vida_url'
          )
          .in('id', personaIds);
        if (!personasRes.error && personasRes.data) {
          personasById = (personasRes.data as any[]).reduce(
            (acc: any, p: any) => {
              acc[p.id] = p;
              return acc;
            },
            {}
          );
        }
      }

      if (vacanteIds.length > 0) {
        const vacRes = await this.supa.cliente
          .from('vacantes')
          .select('id,titulo,empresa_id')
          .in('id', vacanteIds);
        if (!vacRes.error && vacRes.data) {
          vacantesById = (vacRes.data as any[]).reduce((acc: any, v: any) => {
            acc[v.id] = v;
            return acc;
          }, {});
        }
      }

      return rows.map((r: any) => ({
        id: r.id,
        estado: r.estado,
        creadaEn: r.creada_en ? new Date(r.creada_en).getTime() : undefined,
        persona: personasById[r.persona_id] || null,
        vacante: vacantesById[r.vacante_id] || null,
      }));
    }

    const rows = (res.data || []) as any[];
    if (!rows.length) return [] as any[];

    const faltantesPersona = rows
      .filter(
        (r) =>
          (!r.personas || Object.keys(r.personas || {}).length === 0) &&
          r.persona_id
      )
      .map((r) => r.persona_id);

    if (faltantesPersona.length) {
      const personasRes = await this.supa.cliente
        .from('personas')
        .select(
          'id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,hoja_vida_url'
        )
        .in('id', [...new Set(faltantesPersona)]);
      if (!personasRes.error && personasRes.data) {
        const personasById = ((personasRes.data || []) as any[]).reduce(
          (acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          },
          {}
        );
        rows.forEach((r) => {
          if (
            (!r.personas || Object.keys(r.personas || {}).length === 0) &&
            r.persona_id
          ) {
            r.personas = personasById[r.persona_id] || null;
          }
        });
      }
    }

    const faltantesVac = rows
      .filter(
        (r) =>
          (!r.vacantes || Object.keys(r.vacantes || {}).length === 0) &&
          r.vacante_id
      )
      .map((r) => r.vacante_id);

    if (faltantesVac.length) {
      const vacRes = await this.supa.cliente
        .from('vacantes')
        .select('id,titulo,empresa_id')
        .in('id', [...new Set(faltantesVac)]);
      if (!vacRes.error && vacRes.data) {
        const vacById = ((vacRes.data || []) as any[]).reduce(
          (acc: any, v: any) => {
            acc[v.id] = v;
            return acc;
          },
          {}
        );
        rows.forEach((r) => {
          if (
            (!r.vacantes || Object.keys(r.vacantes || {}).length === 0) &&
            r.vacante_id
          ) {
            r.vacantes = vacById[r.vacante_id] || null;
          }
        });
      }
    }

    return rows.map((r) => ({
      id: r.id,
      estado: r.estado,
      creadaEn: r.creada_en ? new Date(r.creada_en).getTime() : undefined,
      persona: r.personas || r.persona || null,
      vacante: r.vacantes || r.vacante || null,
    }));
  }

  async contarPostulacionesPendientesEmpresa() {
    const lista = await this.listarPostulacionesPendientesEmpresa();
    return lista.length;
  }

  async aceptarPostulacion(postulacionId: string) {
    const upd = await this.supa.cliente
      .from('postulaciones')
      .update({ estado: 'aceptada' })
      .eq('id', postulacionId)
      .select('id,persona_id,vacante_id')
      .maybeSingle();
    if (upd.error) throw new Error(upd.error.message);
    if (!upd.data?.id)
      throw new Error(
        'No se encontró la postulación o no tienes permiso para modificarla.'
      );
    const personaId = upd.data?.persona_id as string;
    const vacId = upd.data?.vacante_id as string;
    const persona = await this.supa.cliente
      .from('personas')
      .select('id,auth_user_id')
      .eq('id', personaId)
      .maybeSingle();
    const empresa = await this.supa.obtenerEmpresaActual();
    const a = empresa?.auth_user_id as string;
    const b = persona.data?.auth_user_id as string;
    if (a && b) await this.chat.crearConversacion(a, b);
    return { id: postulacionId, vacanteId: vacId };
  }

  async rechazarPostulacion(postulacionId: string) {
    const upd = await this.supa.cliente
      .from('postulaciones')
      .update({ estado: 'rechazada' })
      .eq('id', postulacionId)
      .select('id')
      .maybeSingle();
    if (upd.error) throw new Error(upd.error.message);
    if (!upd.data?.id)
      throw new Error(
        'No se encontró la postulación o no tienes permiso para modificarla.'
      );
    return true;
  }

  async suscribirPostulacionesEmpresa(onChange: () => void) {
    const ch = this.supa.cliente.channel('postulaciones_empresa');
    ch.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'postulaciones' },
      () => {
        try {
          onChange();
        } catch {}
      }
    );
    await ch.subscribe();
    return ch;
  }
}
