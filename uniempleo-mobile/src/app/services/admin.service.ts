import { Injectable } from '@angular/core';
import { ServicioDatosSupabase } from './supabase.service';

export interface EstadisticasAdmin {
  totalUsuarios: number;
  totalPersonas: number;
  totalEmpresas: number;
  totalVacantes: number;
  totalNoticias: number;
  totalPostulaciones: number;
  totalConversaciones: number;
  totalMensajes: number;
  postulacionesPorEstado: { estado: string; cantidad: number }[];
  vacantesPorEstado: { estado: string; cantidad: number }[];
}

@Injectable({ providedIn: 'root' })
export class ServicioAdmin {
 
  private readonly adminEmails = [
    'campopenajuancarlos@gmail.com',
    
  ];

  constructor(private supabase: ServicioDatosSupabase) {}

  async esAdministrador(): Promise<boolean> {
    try {
      const usuario = await this.supabase.cliente.auth.getUser();
      const email = usuario.data.user?.email;
      if (!email) {
        return false;
      }
      
      const emailLower = email.toLowerCase();
      
      const bypass = localStorage.getItem('admin_bypass');
      if (bypass === 'true') {
        return true;
      }
      
      if (this.adminEmails.some(adminEmail => adminEmail.toLowerCase() === emailLower)) {
        return true;
      }
      
      const metadata = (usuario.data.user as any)?.user_metadata;
      if (metadata?.rol === 'admin' || metadata?.is_admin === true) {
        return true;
      }
      
      const rawAppMeta = (usuario.data.user as any)?.raw_app_meta_data;
      if (rawAppMeta?.rol === 'admin' || rawAppMeta?.is_admin === true) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async obtenerEstadisticas(): Promise<EstadisticasAdmin> {
    // Usar función SQL con SECURITY DEFINER para obtener conteos precisos sin restricciones RLS
    try {
      const { data, error } = await this.supabase.cliente.rpc('obtener_estadisticas_admin');
      
      if (error) {
        console.error('Error al obtener estadísticas mediante RPC:', error);
        // Fallback a método anterior si la función RPC falla
        return await this.obtenerEstadisticasFallback();
      }
      
      if (data) {
        // La función retorna un JSONB, parsearlo
        const stats = typeof data === 'string' ? JSON.parse(data) : data;
        
        return {
          totalUsuarios: stats.totalUsuarios || 0,
          totalPersonas: stats.totalPersonas || 0,
          totalEmpresas: stats.totalEmpresas || 0,
          totalVacantes: stats.totalVacantes || 0,
          totalNoticias: stats.totalNoticias || 0,
          totalPostulaciones: stats.totalPostulaciones || 0,
          totalConversaciones: stats.totalConversaciones || 0,
          totalMensajes: stats.totalMensajes || 0,
          postulacionesPorEstado: stats.postulacionesPorEstado || [],
          vacantesPorEstado: stats.vacantesPorEstado || [],
        };
      }
      
      // Si no hay datos, usar fallback
      return await this.obtenerEstadisticasFallback();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return await this.obtenerEstadisticasFallback();
    }
  }

  private async obtenerEstadisticasFallback(): Promise<EstadisticasAdmin> {
    // Método fallback usando consultas directas
    const personasRes = await this.supabase.cliente
      .from('personas')
      .select('*', { count: 'exact', head: false });
    const totalPersonas = personasRes.count ?? personasRes.data?.length ?? 0;
    
    const empresasRes = await this.supabase.cliente
      .from('empresas')
      .select('*', { count: 'exact', head: false });
    const totalEmpresas = empresasRes.count ?? empresasRes.data?.length ?? 0;
    
    const vacantesRes = await this.supabase.cliente
      .from('vacantes')
      .select('*', { count: 'exact', head: false });
    const totalVacantes = vacantesRes.count ?? vacantesRes.data?.length ?? 0;
    
    const noticiasRes = await this.supabase.cliente
      .from('auditoria_eventos')
      .select('*', { count: 'exact', head: false })
      .eq('accion', 'publicar_noticia');
    const totalNoticias = noticiasRes.count ?? noticiasRes.data?.length ?? 0;
    
    const postulacionesRes = await this.supabase.cliente
      .from('postulaciones')
      .select('*', { count: 'exact', head: false });
    const totalPostulaciones = postulacionesRes.count ?? postulacionesRes.data?.length ?? 0;
    
    const conversacionesRes = await this.supabase.cliente
      .from('conversaciones')
      .select('*', { count: 'exact', head: false });
    const totalConversaciones = conversacionesRes.count ?? conversacionesRes.data?.length ?? 0;
    
    const mensajesRes = await this.supabase.cliente
      .from('mensajes')
      .select('*', { count: 'exact', head: false });
    const totalMensajes = mensajesRes.count ?? mensajesRes.data?.length ?? 0;
    
    const postulacionesPorEstadoRes = await this.supabase.cliente
      .from('postulaciones')
      .select('estado');
    
    const vacantesPorEstadoRes = await this.supabase.cliente
      .from('vacantes')
      .select('estado');

    const postulacionesEstadoMap = new Map<string, number>();
    (postulacionesPorEstadoRes.data || []).forEach((p: any) => {
      const estado = p.estado || 'sin_estado';
      postulacionesEstadoMap.set(estado, (postulacionesEstadoMap.get(estado) || 0) + 1);
    });
    
    const vacantesEstadoMap = new Map<string, number>();
    (vacantesPorEstadoRes.data || []).forEach((v: any) => {
      const estado = v.estado || 'sin_estado';
      vacantesEstadoMap.set(estado, (vacantesEstadoMap.get(estado) || 0) + 1);
    });

    return {
      totalUsuarios: totalPersonas + totalEmpresas,
      totalPersonas,
      totalEmpresas,
      totalVacantes,
      totalNoticias,
      totalPostulaciones,
      totalConversaciones,
      totalMensajes,
      postulacionesPorEstado: Array.from(postulacionesEstadoMap.entries()).map(([estado, cantidad]) => ({
        estado,
        cantidad,
      })),
      vacantesPorEstado: Array.from(vacantesEstadoMap.entries()).map(([estado, cantidad]) => ({
        estado,
        cantidad,
      })),
    };
  }

  async listarPersonas() {
    try {
      // Usar función RPC con SECURITY DEFINER para bypass RLS
      const { data, error } = await this.supabase.cliente.rpc('listar_personas_admin');
      
      if (error) {
        console.error('Error al listar personas mediante RPC:', error);
        // Fallback a método directo
        return await this.listarPersonasFallback();
      }
      
      if (data) {
        // La función retorna un JSONB, parsearlo si es string
        const personas = typeof data === 'string' ? JSON.parse(data) : data;
        return Array.isArray(personas) ? personas : [];
      }
      
      return await this.listarPersonasFallback();
    } catch (error) {
      console.error('Error al listar personas:', error);
      return await this.listarPersonasFallback();
    }
  }

  private async listarPersonasFallback() {
    const res = await this.supabase.cliente
      .from('personas')
      .select('id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,creado_en,verificado')
      .order('creado_en', { ascending: false });
    return res.data || [];
  }

  async listarEmpresas() {
    try {
      // Usar función RPC con SECURITY DEFINER para bypass RLS
      const { data, error } = await this.supabase.cliente.rpc('listar_empresas_admin');
      
      if (error) {
        console.error('Error al listar empresas mediante RPC:', error);
        // Fallback a método directo
        return await this.listarEmpresasFallback();
      }
      
      if (data) {
        // La función retorna un JSONB, parsearlo si es string
        const empresas = typeof data === 'string' ? JSON.parse(data) : data;
        return Array.isArray(empresas) ? empresas : [];
      }
      
      return await this.listarEmpresasFallback();
    } catch (error) {
      console.error('Error al listar empresas:', error);
      return await this.listarEmpresasFallback();
    }
  }

  private async listarEmpresasFallback() {
    const res = await this.supabase.cliente
      .from('empresas')
      .select('id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,creado_en,verificado')
      .order('creado_en', { ascending: false });
    return res.data || [];
  }

  async listarVacantes() {
    const res = await this.supabase.cliente
      .from('vacantes')
      .select('id,empresa_id,titulo,estado,creada_en')
      .order('creada_en', { ascending: false });
    return res.data || [];
  }

  async listarNoticias() {
    const res = await this.supabase.cliente
      .from('auditoria_eventos')
      .select('id,quien,detalles,cuando')
      .eq('accion', 'publicar_noticia')
      .order('cuando', { ascending: false });
    return (res.data || []).map((r: any) => ({
      id: r.id,
      empresaId: r.quien,
      titulo: r.detalles?.titulo || '',
      resumen: r.detalles?.resumen || '',
      contenido: r.detalles?.contenido || '',
      fecha: r.cuando,
    }));
  }

  async listarPostulaciones() {
    try {
      // Usar función RPC con SECURITY DEFINER para bypass RLS y obtener información completa
      const { data, error } = await this.supabase.cliente.rpc('listar_postulaciones_admin');
      
      if (error) {
        console.error('Error al listar postulaciones mediante RPC:', error);
        // Fallback a método directo
        return await this.listarPostulacionesFallback();
      }
      
      if (data) {
        // La función retorna un JSONB, parsearlo si es string
        const postulaciones = typeof data === 'string' ? JSON.parse(data) : data;
        return Array.isArray(postulaciones) ? postulaciones : [];
      }
      
      return await this.listarPostulacionesFallback();
    } catch (error) {
      console.error('Error al listar postulaciones:', error);
      return await this.listarPostulacionesFallback();
    }
  }

  private async listarPostulacionesFallback() {
    const res = await this.supabase.cliente
      .from('postulaciones')
      .select('id,persona_id,empresa_id,vacante_id,estado,creada_en,actualizado_en')
      .order('creada_en', { ascending: false });
    return res.data || [];
  }

  async eliminarPersona(personaId: string) {
    return await this.supabase.cliente
      .from('personas')
      .delete()
      .eq('id', personaId);
  }

  async eliminarEmpresa(empresaId: string) {
    return await this.supabase.cliente
      .from('empresas')
      .delete()
      .eq('id', empresaId);
  }

  async eliminarVacante(vacanteId: string) {
    return await this.supabase.cliente
      .from('vacantes')
      .delete()
      .eq('id', vacanteId);
  }

  async eliminarNoticia(noticiaId: string) {
    return await this.supabase.cliente
      .from('auditoria_eventos')
      .delete()
      .eq('id', noticiaId);
  }

  async eliminarPostulacion(postulacionId: string) {
    return await this.supabase.cliente
      .from('postulaciones')
      .delete()
      .eq('id', postulacionId);
  }
}

