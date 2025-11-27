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
        console.log('⚠️ No se pudo obtener el email del usuario');
        return false;
      }
      
      const emailLower = email.toLowerCase();
      console.log('🔍 Verificando acceso de admin para:', emailLower);
      console.log('📋 Lista de admins actual:', this.adminEmails);
      
      
      const bypass = localStorage.getItem('admin_bypass');
      if (bypass === 'true') {
        console.warn('⚠️ MODO BYPASS ACTIVADO - Acceso temporal permitido');
        console.log('📧 Tu email es:', emailLower);
        console.log('📝 Para acceso permanente, agrega este email en admin.service.ts:');
        console.log(`   '${emailLower}',`);
        return true;
      }
      
     
      if (this.adminEmails.some(adminEmail => adminEmail.toLowerCase() === emailLower)) {
        console.log('✅ Acceso de administrador concedido');
        return true;
      }
      
      
      const metadata = (usuario.data.user as any)?.user_metadata;
      if (metadata?.rol === 'admin' || metadata?.is_admin === true) {
        console.log('✅ Acceso de administrador concedido (metadata)');
        return true;
      }
      
      
      const rawAppMeta = (usuario.data.user as any)?.raw_app_meta_data;
      if (rawAppMeta?.rol === 'admin' || rawAppMeta?.is_admin === true) {
        console.log('✅ Acceso de administrador concedido (raw_app_meta_data)');
        return true;
      }
      
      console.log('❌ Acceso denegado.');
      console.log('📧 Tu email es:', emailLower);
      console.log('📝 Para agregar este email como admin:');
      console.log('   1. Abre: src/app/services/admin.service.ts');
      console.log('   2. Agrega en el array adminEmails:');
      console.log(`      '${emailLower}',`);
      console.log('   3. O activa el modo bypass temporal ejecutando en la consola:');
      console.log('      localStorage.setItem("admin_bypass", "true");');
      console.log('      Luego recarga la página');
      return false;
    } catch (error) {
      console.error('Error al verificar si es administrador:', error);
      return false;
    }
  }

  async obtenerEstadisticas(): Promise<EstadisticasAdmin> {
    
    const personas = await this.supabase.cliente
      .from('personas')
      .select('id', { count: 'exact', head: true });
    
   
    const empresas = await this.supabase.cliente
      .from('empresas')
      .select('id', { count: 'exact', head: true });
    
    
    const vacantes = await this.supabase.cliente
      .from('vacantes')
      .select('id', { count: 'exact', head: true });
    
   
    const noticias = await this.supabase.cliente
      .from('auditoria_eventos')
      .select('id', { count: 'exact', head: true })
      .eq('accion', 'publicar_noticia');
    
    const postulaciones = await this.supabase.cliente
      .from('postulaciones')
      .select('id', { count: 'exact', head: true });
    
   
    const conversaciones = await this.supabase.cliente
      .from('conversaciones')
      .select('id', { count: 'exact', head: true });
    

    const mensajes = await this.supabase.cliente
      .from('mensajes')
      .select('id', { count: 'exact', head: true });
    
   
    const postulacionesPorEstado = await this.supabase.cliente
      .from('postulaciones')
      .select('estado');
    
    
    const vacantesPorEstado = await this.supabase.cliente
      .from('vacantes')
      .select('estado');

    
    const postulacionesEstadoMap = new Map<string, number>();
    (postulacionesPorEstado.data || []).forEach((p: any) => {
      const estado = p.estado || 'sin_estado';
      postulacionesEstadoMap.set(estado, (postulacionesEstadoMap.get(estado) || 0) + 1);
    });
    

    const vacantesEstadoMap = new Map<string, number>();
    (vacantesPorEstado.data || []).forEach((v: any) => {
      const estado = v.estado || 'sin_estado';
      vacantesEstadoMap.set(estado, (vacantesEstadoMap.get(estado) || 0) + 1);
    });

   
    const totalUsuarios = (personas.count || 0) + (empresas.count || 0);

    return {
      totalUsuarios,
      totalPersonas: personas.count || 0,
      totalEmpresas: empresas.count || 0,
      totalVacantes: vacantes.count || 0,
      totalNoticias: noticias.count || 0,
      totalPostulaciones: postulaciones.count || 0,
      totalConversaciones: conversaciones.count || 0,
      totalMensajes: mensajes.count || 0,
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
    const res = await this.supabase.cliente
      .from('personas')
      .select('id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,creado_en,verificado')
      .order('creado_en', { ascending: false });
    return res.data || [];
  }

  async listarEmpresas() {
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
    const res = await this.supabase.cliente
      .from('postulaciones')
      .select('id,persona_id,vacante_id,estado,creada_en,actualizado_en')
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

