import { Injectable } from '@angular/core';
import { ServicioDatosSupabase } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ServicioTrazabilidad {
  constructor(private supa: ServicioDatosSupabase) {}

  guardarAuditoria(quienId: string, accion: string, referencia: string, detalle?: any) {
    return this.supa.cliente
      .from('auditoria_eventos')
      .insert({
        quien: quienId,
        accion,
        entidad: 'vacante',
        entidad_id: referencia,
        detalles: detalle || null,
      });
  }
}
