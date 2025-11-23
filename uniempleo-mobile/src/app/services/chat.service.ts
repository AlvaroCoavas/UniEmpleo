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
    const res = await this.supabase.cliente
      .from('conversaciones')
      .select('id,participantes')
      .contains('participantes', [a])
      .contains('participantes', [b])
      .limit(1)
      .maybeSingle();
    if (res.data?.id) return res.data.id as string;
    return undefined;
  }

  async crearConversacion(a: string, b: string) {
    const existente = await this.obtenerConversacionEntre(a, b);
    if (existente) return existente;
    const ins = await this.supabase.cliente
      .from('conversaciones')
      .insert({ participantes: [a, b], ultima_actividad: new Date().toISOString() })
      .select('id')
      .single();
    return ins.data?.id as string;
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
}
