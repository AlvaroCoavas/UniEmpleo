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
        empresa_id: v.empresaId || null,
        persona_id: v.personaId || null,
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
        'id,empresa_id,persona_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en'
      )
      .eq('empresa_id', empresaId)
      .order('creada_en', { ascending: false });
    return (res.data || []).map(
      (d: any) =>
        ({
          id: d.id,
          empresaId: d.empresa_id,
          personaId: d.persona_id,
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

  async listVacantesByPersona(personaId: string) {
    const res = await this.supa.cliente
      .from('vacantes')
      .select(
        'id,empresa_id,persona_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en'
      )
      .eq('persona_id', personaId)
      .order('creada_en', { ascending: false });
    return (res.data || []).map(
      (d: any) =>
        ({
          id: d.id,
          empresaId: d.empresa_id,
          personaId: d.persona_id,
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
        'id,empresa_id,persona_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en'
      )
      .order('creada_en', { ascending: false });
    return (res.data || []).map(
      (d: any) =>
        ({
          id: d.id,
          empresaId: d.empresa_id,
          personaId: d.persona_id,
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
        'id,empresa_id,persona_id,titulo,descripcion,ubicacion,salario,modalidad,estado,creada_en,requisitos'
      )
      .eq('id', id)
      .maybeSingle();
    const d = res.data as any;
    if (!d) return undefined as any;

    // Cargar habilidades
    const habs = await this.supa.cliente
      .from('vacantes_habilidades')
      .select('habilidad:habilidad_id(nombre)')
      .eq('vacante_id', id);

    const habilidades = (habs.data || [])
      .map((h: any) => h.habilidad?.nombre)
      .filter(Boolean);

    return {
      id: d.id,
      empresaId: d.empresa_id,
      personaId: d.persona_id,
      titulo: d.titulo,
      descripcion: d.descripcion,
      requisitos: d.requisitos ?? undefined,
      ubicacion: d.ubicacion || '',
      salario: d.salario ?? undefined,
      modalidad: d.modalidad ?? undefined,
      estado: d.estado,
      habilidades: habilidades,
      createdAt: d.creada_en ? new Date(d.creada_en).getTime() : undefined,
    } as Vacante;
  }

  async postularServicio(vacanteId: string) {
    const empresa = await this.supa.obtenerEmpresaActual();
    if (!empresa?.id)
      throw new Error('Debes iniciar sesión como empresa para postularte.');

    // Verificar que la vacante sea un servicio (tiene persona_id) y no sea de la empresa
    const vacante = await this.supa.cliente
      .from('vacantes')
      .select('id,empresa_id,persona_id')
      .eq('id', vacanteId)
      .maybeSingle();

    if (vacante.error || !vacante.data) {
      throw new Error('El servicio no existe.');
    }

    // Si la vacante tiene empresa_id, significa que es una vacante de empresa, no un servicio
    if (vacante.data.empresa_id) {
      throw new Error(
        'No puedes postularte a una vacante de empresa. Este es un servicio de persona.'
      );
    }

    // Si no tiene persona_id, algo está mal
    if (!vacante.data.persona_id) {
      throw new Error('Este no es un servicio válido.');
    }

    // Verificar que la empresa no se esté postulando a su propia vacante (aunque no debería pasar)
    if (vacante.data.empresa_id === empresa.id) {
      throw new Error('No puedes postularte a tu propia vacante.');
    }

    const existente = await this.supa.cliente
      .from('postulaciones')
      .select('id,estado')
      .eq('vacante_id', vacanteId)
      .eq('empresa_id', empresa.id)
      .maybeSingle();
    if (existente.data?.id)
      throw new Error('Ya te postulaste a este servicio.');
    const ins = await this.supa.cliente
      .from('postulaciones')
      .insert({
        vacante_id: vacanteId,
        empresa_id: empresa.id,
        estado: 'creada',
      })
      .select('id')
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return ins.data?.id as string;
  }

  async postularVacante(vacanteId: string) {
    const persona = await this.supa.obtenerPersonaActual();
    if (!persona?.id)
      throw new Error('Debes iniciar sesión como egresado para postularte.');

    // Verificar que la vacante no sea de la persona (servicio propio)
    const vacante = await this.supa.cliente
      .from('vacantes')
      .select('id,empresa_id,persona_id')
      .eq('id', vacanteId)
      .maybeSingle();

    if (vacante.error || !vacante.data) {
      throw new Error('La vacante no existe.');
    }

    // Si la vacante tiene persona_id y es la misma persona, no puede postularse a su propio servicio
    if (vacante.data.persona_id === persona.id) {
      throw new Error('No puedes postularte a tu propio servicio.');
    }

    // Si la vacante tiene empresa_id y es de la empresa actual, no puede postularse (aunque esto no debería pasar para personas)
    // Pero permitimos que personas se postulen tanto a vacantes de empresas como a servicios de otras personas

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

  async listarPostulacionesPendientesPersona() {
    const persona = await this.supa.obtenerPersonaActual();
    if (!persona?.id) {
      console.log('No se encontró persona actual');
      return [] as any[];
    }

    console.log('Buscando servicios de persona:', persona.id);
    const vacs = await this.supa.cliente
      .from('vacantes')
      .select('id,titulo,persona_id')
      .eq('persona_id', persona.id);

    if (vacs.error) {
      console.error('Error al obtener servicios:', vacs.error);
      return [] as any[];
    }

    const ids = (vacs.data || []).map((v: any) => v.id);
    console.log('IDs de servicios encontrados:', ids);

    if (ids.length === 0) {
      console.log('No se encontraron servicios para esta persona');
      return [] as any[];
    }

    // Buscar postulaciones de empresas Y de otras personas
    let res = await this.supa.cliente
      .from('postulaciones')
      .select(
        'id,estado,creada_en,empresa_id,persona_id,vacante_id, empresas(id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url), personas(id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,foto_url), vacantes(id,titulo,persona_id)'
      )
      .in('vacante_id', ids)
      .eq('estado', 'creada');

    console.log('Postulaciones encontradas (con join):', res.data?.length || 0);

    if (res.error || !res.data) {
      console.warn('Join falló, usando consultas separadas:', res.error);
      const resSimple = await this.supa.cliente
        .from('postulaciones')
        .select('id,estado,creada_en,empresa_id,persona_id,vacante_id')
        .in('vacante_id', ids)
        .eq('estado', 'creada');

      console.log(
        'Postulaciones encontradas (sin join):',
        resSimple.data?.length || 0
      );

      if (resSimple.error || !resSimple.data || resSimple.data.length === 0) {
        console.log('No hay postulaciones pendientes');
        return [] as any[];
      }

      const rows = resSimple.data as any[];
      const empresaIds = [
        ...new Set(rows.map((r: any) => r.empresa_id).filter(Boolean)),
      ];
      const personaIds = [
        ...new Set(rows.map((r: any) => r.persona_id).filter(Boolean)),
      ];
      const vacanteIds = [
        ...new Set(rows.map((r: any) => r.vacante_id).filter(Boolean)),
      ];

      console.log(
        'IDs encontrados - Empresas:',
        empresaIds.length,
        'Personas:',
        personaIds.length,
        'Vacantes:',
        vacanteIds.length
      );

      let empresasById: any = {};
      let personasById: any = {};
      let vacantesById: any = {};

      if (empresaIds.length > 0) {
        const empresasRes = await this.supa.cliente
          .from('empresas')
          .select(
            'id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url'
          )
          .in('id', empresaIds);
        if (!empresasRes.error && empresasRes.data) {
          empresasById = (empresasRes.data as any[]).reduce(
            (acc: any, e: any) => {
              acc[e.id] = e;
              return acc;
            },
            {}
          );
          console.log('Empresas cargadas:', Object.keys(empresasById).length);
        } else {
          console.error('Error al cargar empresas:', empresasRes.error);
        }
      }

      if (personaIds.length > 0) {
        const personasRes = await this.supa.cliente
          .from('personas')
          .select(
            'id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,foto_url'
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
          console.log('Personas cargadas:', Object.keys(personasById).length);
        } else {
          console.error('Error al cargar personas:', personasRes.error);
        }
      }

      if (vacanteIds.length > 0) {
        const vacRes = await this.supa.cliente
          .from('vacantes')
          .select('id,titulo,persona_id')
          .in('id', vacanteIds);
        if (!vacRes.error && vacRes.data) {
          vacantesById = (vacRes.data as any[]).reduce((acc: any, v: any) => {
            acc[v.id] = v;
            return acc;
          }, {});
        }
      }

      const resultado = rows.map((r: any) => {
        const empresa = empresasById[r.empresa_id] || null;
        const persona = personasById[r.persona_id] || null;
        const vacante = vacantesById[r.vacante_id] || null;

        console.log('Procesando postulación:', {
          id: r.id,
          tieneEmpresa: !!empresa,
          tienePersona: !!persona,
          empresaId: r.empresa_id,
          personaId: r.persona_id,
        });

        return {
          id: r.id,
          estado: r.estado,
          creadaEn: r.creada_en ? new Date(r.creada_en).getTime() : undefined,
          empresa: empresa,
          persona: persona,
          vacante: vacante,
        };
      });

      console.log('Resultado final:', resultado.length, 'solicitudes');
      return resultado;
    }

    const rows = (res.data || []) as any[];
    if (!rows.length) return [] as any[];

    // Procesar datos del join - incluir tanto empresas como personas
    // Necesitamos manejar casos donde el join puede devolver objetos anidados o arrays
    const faltantesPersona = rows
      .filter(
        (r) =>
          (!r.personas ||
            (Array.isArray(r.personas) && r.personas.length === 0) ||
            Object.keys(r.personas || {}).length === 0) &&
          r.persona_id
      )
      .map((r) => r.persona_id);

    if (faltantesPersona.length) {
      const personasRes = await this.supa.cliente
        .from('personas')
        .select(
          'id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,foto_url'
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
            (!r.personas ||
              (Array.isArray(r.personas) && r.personas.length === 0) ||
              Object.keys(r.personas || {}).length === 0) &&
            r.persona_id
          ) {
            r.personas = personasById[r.persona_id] || null;
          }
        });
      }
    }

    const faltantesEmpresa = rows
      .filter(
        (r) =>
          (!r.empresas ||
            (Array.isArray(r.empresas) && r.empresas.length === 0) ||
            Object.keys(r.empresas || {}).length === 0) &&
          r.empresa_id
      )
      .map((r) => r.empresa_id);

    if (faltantesEmpresa.length) {
      const empresasRes = await this.supa.cliente
        .from('empresas')
        .select(
          'id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url'
        )
        .in('id', [...new Set(faltantesEmpresa)]);
      if (!empresasRes.error && empresasRes.data) {
        const empresasById = ((empresasRes.data || []) as any[]).reduce(
          (acc: any, e: any) => {
            acc[e.id] = e;
            return acc;
          },
          {}
        );
        rows.forEach((r) => {
          if (
            (!r.empresas ||
              (Array.isArray(r.empresas) && r.empresas.length === 0) ||
              Object.keys(r.empresas || {}).length === 0) &&
            r.empresa_id
          ) {
            r.empresas = empresasById[r.empresa_id] || null;
          }
        });
      }
    }

    return rows.map((r: any) => {
      // Manejar casos donde personas/empresas pueden ser arrays o objetos
      let persona = null;
      let empresa = null;

      if (r.personas) {
        persona = Array.isArray(r.personas)
          ? r.personas[0] || null
          : r.personas;
      }

      if (r.empresas) {
        empresa = Array.isArray(r.empresas)
          ? r.empresas[0] || null
          : r.empresas;
      }

      return {
        id: r.id,
        estado: r.estado,
        creadaEn: r.creada_en ? new Date(r.creada_en).getTime() : undefined,
        empresa: empresa,
        persona: persona,
        vacante: Array.isArray(r.vacantes)
          ? r.vacantes[0] || null
          : r.vacantes || null,
      };
    });
  }

  async contarPostulacionesPendientesPersona() {
    const lista = await this.listarPostulacionesPendientesPersona();
    return lista.length;
  }

  async aceptarPostulacionPersona(postulacionId: string) {
    const upd = await this.supa.cliente
      .from('postulaciones')
      .update({ estado: 'aceptada' })
      .eq('id', postulacionId)
      .select('id,empresa_id,persona_id,vacante_id')
      .maybeSingle();
    if (upd.error) throw new Error(upd.error.message);
    if (!upd.data?.id)
      throw new Error(
        'No se encontró la postulación o no tienes permiso para modificarla.'
      );
    const empresaId = upd.data?.empresa_id as string | null;
    const personaPostulanteId = upd.data?.persona_id as string | null;
    const vacId = upd.data?.vacante_id as string;

    const persona = await this.supa.obtenerPersonaActual();
    if (!persona?.auth_user_id) {
      throw new Error(
        'No se pudo obtener la información de la persona actual.'
      );
    }

    // Obtener auth_user_id del postulante usando función de base de datos
    // Esto evita problemas de RLS
    let postulanteAuthId: string | null = null;

    try {
      // Intentar usar la función de base de datos primero (más seguro con RLS)
      const funcionResult = await this.supa.cliente.rpc(
        'obtener_auth_user_id_postulante',
        {
          p_postulacion_id: postulacionId,
        }
      );

      if (funcionResult.data && funcionResult.data !== null) {
        postulanteAuthId = funcionResult.data as string;
        console.log(
          'auth_user_id obtenido mediante función:',
          postulanteAuthId
        );
      } else {
        // Si la función no está disponible o retorna null, usar método directo
        console.log(
          'Función no disponible o retornó null, usando método directo'
        );
        throw new Error('Función no disponible');
      }
    } catch (funcionError: any) {
      // Fallback: intentar obtener directamente (puede fallar por RLS)
      console.log('Usando método directo como fallback');

      // Priorizar empresa_id si existe (empresa postulándose a servicio de persona)
      if (empresaId) {
        const empresa = await this.supa.cliente
          .from('empresas')
          .select('auth_user_id')
          .eq('id', empresaId)
          .maybeSingle();
        if (empresa.error) {
          console.error('Error al obtener empresa:', empresa.error);
          throw new Error(
            `Error al obtener datos de la empresa: ${empresa.error.message}`
          );
        }
        if (!empresa.data) {
          throw new Error(`No se encontró la empresa con ID ${empresaId}.`);
        }
        if (!empresa.data.auth_user_id) {
          throw new Error(
            `La empresa con ID ${empresaId} no tiene auth_user_id asociado.`
          );
        }
        postulanteAuthId = empresa.data.auth_user_id;
      }
      // Si no hay empresa_id, buscar persona_id (persona postulándose a servicio de otra persona)
      else if (personaPostulanteId) {
        console.log('Buscando persona postulante con ID:', personaPostulanteId);
        const personaPostulante = await this.supa.cliente
          .from('personas')
          .select('id,auth_user_id,nombre_completo')
          .eq('id', personaPostulanteId)
          .maybeSingle();

        if (personaPostulante.error) {
          console.error(
            'Error al obtener persona postulante:',
            personaPostulante.error
          );
          throw new Error(
            `Error al obtener datos de la persona postulante: ${personaPostulante.error.message}. Esto puede deberse a políticas de seguridad (RLS). Si el problema persiste, verifica que la función 'obtener_auth_user_id_postulante' esté creada en la base de datos.`
          );
        }

        if (!personaPostulante.data) {
          throw new Error(
            `No se encontró la persona con ID ${personaPostulanteId}.`
          );
        }

        if (!personaPostulante.data.auth_user_id) {
          console.error(
            'Persona encontrada pero sin auth_user_id:',
            personaPostulante.data
          );
          throw new Error(
            `La persona "${
              personaPostulante.data.nombre_completo || personaPostulanteId
            }" no tiene auth_user_id asociado. Esto puede indicar un problema en el registro.`
          );
        }

        postulanteAuthId = personaPostulante.data.auth_user_id;
        console.log(
          'Persona postulante encontrada con auth_user_id:',
          postulanteAuthId
        );
      }
      // Si no hay ni empresa_id ni persona_id, hay un problema con los datos
      else {
        console.error('Postulación sin postulante:', upd.data);
        throw new Error(
          'La postulación no tiene un postulante asociado (empresa o persona). Verifica los datos de la postulación.'
        );
      }
    }

    const a = persona.auth_user_id;
    const b = postulanteAuthId;

    if (!a || !b) {
      throw new Error(
        'No se pudieron obtener los auth_user_id necesarios para crear la conversación.'
      );
    }

    // Crear conversación - esto es crítico para el intercambio de contactos
    try {
      console.log('Creando conversación entre:', a, 'y', b);
      await this.chat.crearConversacion(a, b);
      console.log('Conversación creada exitosamente');
    } catch (error: any) {
      console.error('Error al crear conversación:', error);
      throw new Error(
        `Error al crear conversación: ${error?.message || 'Error desconocido'}`
      );
    }

    return { id: postulacionId, vacanteId: vacId };
  }

  async rechazarPostulacionPersona(postulacionId: string) {
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

  async suscribirPostulacionesPersona(onChange: () => void) {
    const ch = this.supa.cliente.channel('postulaciones_persona');
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

    if (!personaId) {
      throw new Error('La postulación no tiene una persona asociada.');
    }

    const persona = await this.supa.cliente
      .from('personas')
      .select('id,auth_user_id')
      .eq('id', personaId)
      .maybeSingle();

    if (persona.error) {
      throw new Error(
        `Error al obtener datos de la persona: ${persona.error.message}`
      );
    }

    if (!persona.data?.auth_user_id) {
      throw new Error(
        'No se pudo obtener el auth_user_id de la persona postulante.'
      );
    }

    const empresa = await this.supa.obtenerEmpresaActual();
    if (!empresa?.auth_user_id) {
      throw new Error('No se pudo obtener el auth_user_id de la empresa.');
    }

    const a = empresa.auth_user_id;
    const b = persona.data.auth_user_id;

    // Crear conversación - esto es crítico para el intercambio de contactos
    try {
      await this.chat.crearConversacion(a, b);
    } catch (error: any) {
      console.error('Error al crear conversación:', error);
      throw new Error(
        `Error al crear conversación: ${error?.message || 'Error desconocido'}`
      );
    }

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
