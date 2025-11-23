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
    return (res.data || []).map((r: any) => ({ id: r.id, empresaId: r.quien, titulo: r.detalles?.titulo || '', resumen: r.detalles?.resumen || '', contenido: r.detalles?.contenido || '', video_url: r.detalles?.video_url || null, createdAt: r.cuando ? new Date(r.cuando).getTime() : undefined } as Noticia));
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
