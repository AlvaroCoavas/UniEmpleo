import { Injectable } from '@angular/core';
import { Conversacion } from '../models/conversacion';
import { Mensaje } from '../models/mensaje';
import { ServicioDatosSupabase } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ServicioChat {
  constructor(private supabase: ServicioDatosSupabase) {}

  async listarConversaciones(uid: string) {
    const res = await this.supabase.cliente
      .from('conversaciones')
      .select('id,participantes,ultima_actividad')
      .contains('participantes', [uid])
      .order('ultima_actividad', { ascending: false });
    const rows = res.data || [];
    return rows.map((r: any) => ({ id: r.id, participants: r.participantes, lastMessageAt: r.ultima_actividad ? new Date(r.ultima_actividad).getTime() : undefined } as Conversacion));
  }

  async obtenerConversacionEntre(a: string, b: string) {
    if (!a || !b) return undefined;
    
    // Buscar conversación donde ambos participantes estén en el array
    // Usamos contains para verificar que ambos IDs estén presentes
    const res = await this.supabase.cliente
      .from('conversaciones')
      .select('id,participantes')
      .contains('participantes', [a, b])
      .limit(1)
      .maybeSingle();
    
    if (res.error) {
      console.error('Error al buscar conversación existente:', res.error);
      return undefined;
    }
    
    // Verificar que ambos participantes estén realmente en el array
    if (res.data?.id && res.data.participantes) {
      const participantes = res.data.participantes as string[];
      if (participantes.includes(a) && participantes.includes(b)) {
        return res.data.id as string;
      }
    }
    
    return undefined;
  }

  async crearConversacion(a: string, b: string) {
    if (!a || !b) {
      throw new Error('Se requieren ambos auth_user_id para crear una conversación.');
    }
    if (a === b) {
      throw new Error('No se puede crear una conversación consigo mismo.');
    }
    
    // Verificar si ya existe una conversación entre estos dos usuarios
    const existente = await this.obtenerConversacionEntre(a, b);
    if (existente) {
      return existente;
    }
    
    // Crear nueva conversación
    const ins = await this.supabase.cliente
      .from('conversaciones')
      .insert({ 
        participantes: [a, b], 
        ultima_actividad: new Date().toISOString() 
      })
      .select('id')
      .single();
    
    if (ins.error) {
      console.error('Error al crear conversación:', ins.error);
      throw new Error(`Error al crear conversación: ${ins.error.message}`);
    }
    
    if (!ins.data?.id) {
      throw new Error('No se pudo crear la conversación. No se recibió un ID válido.');
    }
    
    return ins.data.id as string;
  }

  async enviarMensaje(convId: string, msg: Omit<Mensaje, 'id'>) {
    const ins = await this.supabase.cliente
      .from('mensajes')
      .insert({ conversacion_id: convId, remitente: msg.senderId, texto: msg.text, creado_en: new Date(msg.createdAt).toISOString() })
      .select('id')
      .single();
    await this.supabase.cliente
      .from('conversaciones')
      .update({ ultima_actividad: new Date().toISOString() })
      .eq('id', convId);
    return ins.data?.id as string;
  }

  async listarMensajes(convId: string) {
    const res = await this.supabase.cliente
      .from('mensajes')
      .select('id,remitente,texto,creado_en')
      .eq('conversacion_id', convId)
      .order('creado_en', { ascending: true });
    const rows = res.data || [];
    return rows.map((r: any) => ({ id: r.id, senderId: r.remitente, text: r.texto, createdAt: r.creado_en ? new Date(r.creado_en).getTime() : Date.now() } as Mensaje));
  }

  suscribirMensajes(convId: string, callback: (mensaje: Mensaje) => void) {
    const channel = this.supabase.cliente.channel(`mensajes:${convId}`);
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${convId}`,
        },
        (payload: any) => {
          const nuevoMensaje = payload.new;
          callback({
            id: nuevoMensaje.id,
            senderId: nuevoMensaje.remitente,
            text: nuevoMensaje.texto,
            createdAt: nuevoMensaje.creado_en ? new Date(nuevoMensaje.creado_en).getTime() : Date.now(),
          });
        }
      )
      .subscribe();
    return channel;
  }

  async marcarMensajesComoLeidos(uid: string, conversacionId: string, ultimoMensajeId?: string) {
    try {
      await this.supabase.cliente
        .from('mensajes_leidos')
        .upsert({
          usuario_id: uid,
          conversacion_id: conversacionId,
          ultimo_mensaje_leido_id: ultimoMensajeId || null,
          ultima_lectura: new Date().toISOString(),
        }, {
          onConflict: 'usuario_id,conversacion_id'
        });
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  }

  async contarMensajesNoLeidosPorConversacion(uid: string, conversacionId: string): Promise<number> {
    try {
      // Obtener el último mensaje leído por el usuario
      const lecturaRes = await this.supabase.cliente
        .from('mensajes_leidos')
        .select('ultimo_mensaje_leido_id, ultima_lectura')
        .eq('usuario_id', uid)
        .eq('conversacion_id', conversacionId)
        .maybeSingle();

      // Si no hay registro de lectura, contar todos los mensajes recibidos directamente en la BD
      if (!lecturaRes.data || !lecturaRes.data.ultimo_mensaje_leido_id) {
        const res = await this.supabase.cliente
          .from('mensajes')
          .select('id', { count: 'exact', head: true })
          .eq('conversacion_id', conversacionId)
          .neq('remitente', uid);
        return res.count || 0;
      }

      // Obtener la fecha del último mensaje leído
      const ultimoMensajeLeidoRes = await this.supabase.cliente
        .from('mensajes')
        .select('creado_en')
        .eq('id', lecturaRes.data.ultimo_mensaje_leido_id)
        .maybeSingle();

      if (!ultimoMensajeLeidoRes.data) {
        // Si no se encuentra el mensaje, contar todos los recibidos
        const res = await this.supabase.cliente
          .from('mensajes')
          .select('id', { count: 'exact', head: true })
          .eq('conversacion_id', conversacionId)
          .neq('remitente', uid);
        return res.count || 0;
      }

      // Contar mensajes recibidos después de la fecha del último leído
      const res = await this.supabase.cliente
        .from('mensajes')
        .select('id', { count: 'exact', head: true })
        .eq('conversacion_id', conversacionId)
        .neq('remitente', uid)
        .gt('creado_en', ultimoMensajeLeidoRes.data.creado_en);
      
      return res.count || 0;
    } catch (error) {
      console.error('Error al contar mensajes no leídos por conversación:', error);
      return 0;
    }
  }

  async contarMensajesNoLeidosPorConversaciones(uid: string, conversacionIds: string[]): Promise<Map<string, number>> {
    try {
      if (!conversacionIds.length) return new Map();

      // Obtener todos los registros de lectura de una vez
      const lecturasRes = await this.supabase.cliente
        .from('mensajes_leidos')
        .select('conversacion_id, ultimo_mensaje_leido_id')
        .eq('usuario_id', uid)
        .in('conversacion_id', conversacionIds);

      const lecturasMap = new Map<string, string>();
      if (lecturasRes.data) {
        for (const lectura of lecturasRes.data) {
          if (lectura.ultimo_mensaje_leido_id) {
            lecturasMap.set(lectura.conversacion_id, lectura.ultimo_mensaje_leido_id);
          }
        }
      }

      // Obtener fechas de los últimos mensajes leídos
      const ultimosMensajesIds = Array.from(lecturasMap.values());
      const fechasMap = new Map<string, string>();
      
      if (ultimosMensajesIds.length > 0) {
        const fechasRes = await this.supabase.cliente
          .from('mensajes')
          .select('id, creado_en')
          .in('id', ultimosMensajesIds);
        
        if (fechasRes.data) {
          for (const msg of fechasRes.data) {
            fechasMap.set(msg.id, msg.creado_en);
          }
        }
      }

      // Contar mensajes no leídos para cada conversación en paralelo
      const promesas = conversacionIds.map(async (convId) => {
        const ultimoMensajeLeidoId = lecturasMap.get(convId);
        
        if (!ultimoMensajeLeidoId) {
          // Sin registro de lectura, contar todos los recibidos
          const res = await this.supabase.cliente
            .from('mensajes')
            .select('id', { count: 'exact', head: true })
            .eq('conversacion_id', convId)
            .neq('remitente', uid);
          return { convId, count: res.count || 0 };
        }

        const fechaUltimoLeido = fechasMap.get(ultimoMensajeLeidoId);
        if (!fechaUltimoLeido) {
          // No se encontró la fecha, contar todos
          const res = await this.supabase.cliente
            .from('mensajes')
            .select('id', { count: 'exact', head: true })
            .eq('conversacion_id', convId)
            .neq('remitente', uid);
          return { convId, count: res.count || 0 };
        }

        // Contar mensajes después de la fecha
        const res = await this.supabase.cliente
          .from('mensajes')
          .select('id', { count: 'exact', head: true })
          .eq('conversacion_id', convId)
          .neq('remitente', uid)
          .gt('creado_en', fechaUltimoLeido);
        
        return { convId, count: res.count || 0 };
      });

      const resultados = await Promise.all(promesas);
      const resultadoMap = new Map<string, number>();
      for (const resultado of resultados) {
        resultadoMap.set(resultado.convId, resultado.count);
      }

      return resultadoMap;
    } catch (error) {
      console.error('Error al contar mensajes no leídos por conversaciones:', error);
      return new Map();
    }
  }

  async contarConversacionesConMensajesNoLeidos(uid: string): Promise<number> {
    try {
      const conversaciones = await this.listarConversaciones(uid);
      if (!conversaciones.length) return 0;

      const conversacionIds = conversaciones
        .map((c) => c.id)
        .filter((id): id is string => !!id);

      if (!conversacionIds.length) return 0;

      // Usar el método optimizado que carga todos los conteos en paralelo
      const conteosMap = await this.contarMensajesNoLeidosPorConversaciones(uid, conversacionIds);
      
      // Contar cuántas conversaciones tienen mensajes no leídos
      let conversacionesConMensajes = 0;
      for (const count of conteosMap.values()) {
        if (count > 0) {
          conversacionesConMensajes++;
        }
      }

      return conversacionesConMensajes;
    } catch (error) {
      console.error('Error al contar conversaciones con mensajes no leídos:', error);
      return 0;
    }
  }

  async contarMensajesNoLeidos(uid: string) {
    // Este método ahora cuenta conversaciones con mensajes no leídos, no mensajes totales
    return this.contarConversacionesConMensajesNoLeidos(uid);
  }
}
