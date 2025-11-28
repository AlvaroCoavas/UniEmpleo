import { Injectable } from '@angular/core';
import { ServicioDatosSupabase } from './supabase.service';

export interface Noticia {
  id?: string;
  empresaId: string;
  titulo: string;
  resumen?: string;
  contenido?: string;
  video_url?: string | null;
  createdAt?: number;
}

@Injectable({ providedIn: 'root' })
export class ServicioNoticias {
  constructor(private supa: ServicioDatosSupabase) {}

  async crearNoticia(n: Omit<Noticia, 'id' | 'createdAt'>) {
    const ins = await this.supa.cliente
      .from('auditoria_eventos')
      .insert({
        quien: n.empresaId,
        accion: 'publicar_noticia',
        entidad: 'empresa',
        entidad_id: n.empresaId,
        detalles: { titulo: n.titulo, resumen: n.resumen || '', contenido: n.contenido || '' },
      })
      .select('id')
      .single();
    return { id: ins.data?.id } as any;
  }

  async listarNoticias() {
    const res = await this.supa.cliente
      .from('auditoria_eventos')
      .select('id,quien,accion,detalles,cuando')
      .eq('accion', 'publicar_noticia')
      .order('cuando', { ascending: false });
    
    const noticiasBase = res.data || [];
    
    // Filtrar duplicados por ID (por si acaso existen duplicados en la BD)
    const noticiasUnicas = Array.from(
      new Map(noticiasBase.map((r: any) => [r.id, r])).values()
    );
    
    const noticias: any[] = [];
    
    // Obtener los IDs reales de las empresas en batch
    const authUserIds = [...new Set(noticiasUnicas.map((r: any) => r.quien).filter(Boolean))];
    const empresasRes = await this.supa.cliente
      .from('empresas')
      .select('id, auth_user_id')
      .in('auth_user_id', authUserIds);
    
    const empresasMap = new Map<string, string>();
    (empresasRes.data || []).forEach((e: any) => {
      if (e.auth_user_id && e.id) {
        empresasMap.set(e.auth_user_id, e.id);
      }
    });
    
    // Mapear noticias con el ID real de la empresa
    for (const r of noticiasUnicas) {
      const empresaIdReal = empresasMap.get(r.quien) || r.quien;
      noticias.push({
        id: r.id,
        empresaId: r.quien, // auth_user_id original
        empresaIdReal: empresaIdReal, // id real de la empresa
        titulo: r.detalles?.titulo || '',
        resumen: r.detalles?.resumen || '',
        contenido: r.detalles?.contenido || '',
        video_url: r.detalles?.video_url || null,
        createdAt: r.cuando ? new Date(r.cuando).getTime() : undefined
      });
    }
    
    return noticias as any[];
  }

  async listarNoticiasPorEmpresa(empresaId: string) {
    const res = await this.supa.cliente
      .from('auditoria_eventos')
      .select('id,quien,accion,detalles,cuando')
      .eq('accion', 'publicar_noticia')
      .eq('quien', empresaId)
      .order('cuando', { ascending: false });
    return (res.data || []).map((r: any) => ({ id: r.id, empresaId: r.quien, titulo: r.detalles?.titulo || '', resumen: r.detalles?.resumen || '', contenido: r.detalles?.contenido || '', video_url: r.detalles?.video_url || null, createdAt: r.cuando ? new Date(r.cuando).getTime() : undefined } as Noticia));
  }

  async actualizarNoticia(id: string, patch: { titulo?: string; resumen?: string; contenido?: string; video_url?: string | null }) {
    const res = await this.supa.cliente
      .from('auditoria_eventos')
      .update({ detalles: patch as any })
      .eq('id', id)
      .select('id')
      .single();
    return res.data?.id as string;
  }

  async eliminarNoticia(id: string) {
    return this.supa.cliente.from('auditoria_eventos').delete().eq('id', id);
  }
}
