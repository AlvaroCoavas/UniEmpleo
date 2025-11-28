import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ServicioChat } from '../../services/chat.service';
import { Mensaje } from '../../models/mensaje';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioVacantes } from '../../services/vacantes.service';
import { Router, RouterModule } from '@angular/router';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule, EmptyStateComponent],
})
export class PaginaChat implements OnInit, OnDestroy {
  conversaciones: any[] = [];
  mensajes: Mensaje[] = [];
  conversacionSeleccionada?: string;
  texto = '';
  cuentas: any[] = [];
  tipoListado: 'personas' | 'empresas' = 'personas';
  rol?: 'empresa' | 'egresado';
  solicitudesCount: number = 0;
  usuarioId?: string;
  private solicitudesCh: any;
  constructor(
    private chat: ServicioChat,
    private supabase: ServicioDatosSupabase,
    private vacantes: ServicioVacantes,
    private router: Router
  ) {}
  async ngOnInit() {
    try {
      const u = await this.supabase.cliente.auth.getUser();
      this.usuarioId = u.data.user?.id;
      if (this.usuarioId) {
        this.conversaciones = await this.chat.listarConversaciones(this.usuarioId);
      }
    } catch {}
    this.rol = (await this.supabase.obtenerRolActual()) as any;
    await this.cargarSolicitudesCount();
    await this.cargarCuentas();
    if (this.rol === 'empresa') {
      this.solicitudesCh = await this.vacantes.suscribirPostulacionesEmpresa(
        async () => {
          await this.cargarSolicitudesCount();
        }
      );
    }
    
    // Suscribirse a nuevos mensajes para actualizar badges
    this.suscribirANuevosMensajes();
  }

  suscribirANuevosMensajes() {
    if (!this.usuarioId) return;
    
    try {
      const channel = this.supabase.cliente.channel('nuevos_mensajes_chat');
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes',
          },
          (payload: any) => {
            // Actualizar solo el badge específico del contacto afectado
            const nuevoMensaje = payload.new;
            const conversacionId = nuevoMensaje.conversacion_id;
            
            // Si el mensaje no es del usuario actual, actualizar el badge
            if (nuevoMensaje.remitente !== this.usuarioId) {
              // Buscar la cuenta correspondiente verificando las conversaciones
              this.chat.listarConversaciones(this.usuarioId!).then(conversaciones => {
                const conversacion = conversaciones.find(c => c.id === conversacionId);
                if (conversacion) {
                  // Encontrar el contacto que corresponde a esta conversación
                  const otroParticipante = conversacion.participants.find((p: string) => p !== this.usuarioId);
                  if (otroParticipante) {
                    const cuenta = this.cuentas.find(c => 
                      (c.auth_user_id || c.id) === otroParticipante
                    );
                    
                    if (cuenta) {
                      // Actualizar solo este badge específico de forma optimizada
                      this.chat.contarMensajesNoLeidosPorConversacion(
                        this.usuarioId!,
                        conversacionId
                      ).then(noLeidos => {
                        cuenta.mensajesNoLeidos = noLeidos;
                      }).catch(err => {
                        console.error('Error al actualizar badge:', err);
                      });
                    } else {
                      // Si no encontramos la cuenta, recargar todos los conteos
                      this.cargarConteosMensajesNoLeidos();
                    }
                  }
                }
              }).catch(err => {
                console.error('Error al buscar conversación:', err);
                // Fallback: recargar todos
                this.cargarConteosMensajesNoLeidos();
              });
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error al suscribirse a nuevos mensajes:', error);
    }
  }
  async abrir(convId: string) {
    this.conversacionSeleccionada = convId;
    this.mensajes = await this.chat.listarMensajes(convId);
  }
  async enviar() {
    if (!this.conversacionSeleccionada) return;
    const u = await this.supabase.cliente.auth.getUser();
    const uid = u.data.user?.id;
    if (!uid) return;
    await this.chat.enviarMensaje(this.conversacionSeleccionada, {
      senderId: uid,
      text: this.texto,
      createdAt: Date.now(),
    });
    this.texto = '';
    this.mensajes = await this.chat.listarMensajes(
      this.conversacionSeleccionada
    );
  }

  async cargarCuentas() {
    this.cuentas = [];
    try {
      if (this.rol === 'empresa') {
        const empresa = await this.supabase.obtenerEmpresaActual();
        if (!empresa?.id) {
          console.warn('No se encontró empresa actual');
          this.cuentas = [];
          return;
        }
        // Usar solo empresa.id porque vacantes.empresa_id se relaciona con empresas.id, no con auth_user_id
        const vacs = await this.supabase.cliente
          .from('vacantes')
          .select('id')
          .eq('empresa_id', empresa.id);
        if (vacs.error) {
          console.error('Error al obtener vacantes:', vacs.error);
          this.cuentas = [];
          return;
        }
        const vacIds = Array.from(new Set(((vacs.data || []) as any[]).map((v: any) => v.id).filter(Boolean)));
        if (!vacIds.length) { 
          console.warn('No se encontraron vacantes para la empresa');
          this.cuentas = []; 
          return; 
        }
        // Incluir tanto 'aceptada' como 'contratada' para mostrar contactos
        const pos = await this.supabase.cliente
          .from('postulaciones')
          .select('persona_id')
          .in('vacante_id', vacIds)
          .in('estado', ['aceptada', 'contratada']);
        if (pos.error) {
          console.error('Error al obtener postulaciones:', pos.error);
          this.cuentas = [];
          return;
        }
        const personaIds = Array.from(new Set(((pos.data || []) as any[]).map((p: any) => p.persona_id).filter(Boolean)));
        if (!personaIds.length) { 
          console.warn('No se encontraron postulaciones aceptadas/contratadas');
          this.cuentas = []; 
          return; 
        }
        const personas = await this.supabase.cliente
          .from('personas')
          .select('id,auth_user_id,nombre_completo,correo,ciudad,telefono,rol_principal,foto_url')
          .in('id', personaIds);
        if (personas.error) {
          console.error('Error al obtener personas:', personas.error);
          this.cuentas = [];
          return;
        }
        this.cuentas = (personas.data || []).map((p: any) => ({ ...p, tipo: 'persona' }));
        console.log('Contactos cargados para empresa:', this.cuentas.length);
      } else {
        const persona = await this.supabase.obtenerPersonaActual();
        if (!persona?.id) {
          console.warn('No se encontró persona actual');
          this.cuentas = [];
          return;
        }
        
        console.log('Cargando contactos para persona:', persona.id);
        
        // Intentar usar la función de base de datos primero (evita problemas de RLS)
        try {
          const funcionResult = await this.supabase.cliente.rpc('obtener_contactos_persona', {
            p_persona_id: persona.id
          });
          
          if (!funcionResult.error && funcionResult.data && funcionResult.data.length > 0) {
            console.log('Contactos obtenidos mediante función:', funcionResult.data.length);
            this.cuentas = funcionResult.data.map((contacto: any) => ({
              id: contacto.id,
              auth_user_id: contacto.auth_user_id,
              tipo: contacto.tipo,
              nombre_completo: contacto.tipo === 'persona' ? contacto.nombre : undefined,
              razon_social: contacto.tipo === 'empresa' ? contacto.nombre : undefined,
              correo: contacto.correo,
              correo_corporativo: contacto.tipo === 'empresa' ? contacto.correo : undefined,
              ciudad: contacto.ciudad,
              logo_url: contacto.logo_url,
              foto_url: contacto.foto_url,
              sector: undefined, // Se puede agregar si es necesario
              telefono: undefined, // Se puede agregar si es necesario
              rol_principal: undefined, // Se puede agregar si es necesario
            }));
            console.log('Contactos finales cargados para persona:', this.cuentas.length);
            // Cargar conteos de mensajes no leídos
            await this.cargarConteosMensajesNoLeidos();
            return;
          } else {
            console.log('Función no retornó datos, usando método directo');
          }
        } catch (funcionError: any) {
          console.warn('Error al usar función de base de datos, usando método directo:', funcionError);
        }
        
        // Fallback: método directo (puede tener problemas de RLS)
        
        // Obtener postulaciones donde la persona fue aceptada como postulante
        const resPostulante = await this.supabase.cliente
          .from('postulaciones')
          .select('id,vacante_id,empresa_id,persona_id')
          .eq('persona_id', persona.id)
          .in('estado', ['aceptada', 'contratada']);
        if (resPostulante.error) {
          console.error('Error al obtener postulaciones como postulante:', resPostulante.error);
        }
        console.log('Postulaciones donde persona fue aceptada:', resPostulante.data?.length || 0);
        
        // Obtener postulaciones donde la persona aceptó a otros (empresas o personas) en sus servicios
        const servicios = await this.supabase.cliente
          .from('vacantes')
          .select('id')
          .eq('persona_id', persona.id);
        
        console.log('Servicios de la persona:', servicios.data?.length || 0);
        
        let resAceptadas: any[] = [];
        if (!servicios.error && servicios.data && servicios.data.length > 0) {
          const servicioIds = servicios.data.map((s: any) => s.id);
          console.log('Buscando postulaciones aceptadas en servicios:', servicioIds);
          
          const res = await this.supabase.cliente
            .from('postulaciones')
            .select('id,vacante_id,empresa_id,persona_id')
            .in('vacante_id', servicioIds)
            .in('estado', ['aceptada', 'contratada']);
          
          if (res.error) {
            console.error('Error al obtener postulaciones aceptadas:', res.error);
          } else {
            console.log('Postulaciones aceptadas encontradas:', res.data?.length || 0);
            if (res.data) {
              resAceptadas = res.data;
              console.log('Datos de postulaciones aceptadas:', resAceptadas);
            }
          }
        }
        
        const todasLasPostulaciones = [
          ...(resPostulante.data || []),
          ...resAceptadas
        ];
        
        console.log('Total de postulaciones encontradas:', todasLasPostulaciones.length);
        
        if (todasLasPostulaciones.length === 0) {
          console.warn('No se encontraron postulaciones aceptadas/contratadas');
          this.cuentas = [];
          return;
        }
        
        // Obtener empresas directamente de las postulaciones
        const empIds = Array.from(
          new Set(
            todasLasPostulaciones
              .map((r: any) => r.empresa_id)
              .filter(Boolean)
          )
        );
        console.log('IDs de empresas encontradas:', empIds.length);
        
        // Obtener personas que postularon (excluyendo a la persona actual)
        const personaIds = Array.from(
          new Set(
            todasLasPostulaciones
              .map((r: any) => r.persona_id)
              .filter(Boolean)
              .filter((pid: string) => pid !== persona.id) // Excluir a sí mismo
          )
        );
        console.log('IDs de personas encontradas:', personaIds.length, personaIds);
        
        // Si la persona fue aceptada en vacantes de empresa, obtener esas empresas
        const vacIds = Array.from(
          new Set(todasLasPostulaciones.map((r: any) => r.vacante_id).filter(Boolean))
        );
        
        const contactos: any[] = [];
        
        // Cargar empresas directamente de las postulaciones
        if (empIds.length > 0) {
          console.log('Cargando empresas con IDs:', empIds);
        const empRes = await this.supabase.cliente
          .from('empresas')
          .select(
            'id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url'
          )
          .in('id', empIds);
        if (empRes.error) {
            console.error('Error al cargar empresas:', empRes.error);
          } else {
            console.log('Empresas cargadas:', empRes.data?.length || 0);
            if (empRes.data) {
              contactos.push(...empRes.data.map((emp: any) => ({
                ...emp,
                auth_user_id: emp.auth_user_id,
                tipo: 'empresa',
              })));
            }
          }
        }
        
        // Cargar personas que postularon a servicios de la persona actual
        if (personaIds.length > 0) {
          console.log('Cargando personas con IDs:', personaIds);
          const personasRes = await this.supabase.cliente
            .from('personas')
            .select(
              'id,auth_user_id,nombre_completo,correo,ciudad,telefono,rol_principal,foto_url'
            )
            .in('id', personaIds);
          if (personasRes.error) {
            console.error('Error al cargar personas:', personasRes.error);
          } else {
            console.log('Personas cargadas:', personasRes.data?.length || 0);
            if (personasRes.data) {
              contactos.push(...personasRes.data.map((p: any) => ({
                ...p,
                auth_user_id: p.auth_user_id,
                tipo: 'persona',
              })));
        }
          }
        }
        
        // Si la persona fue aceptada en vacantes de empresa, obtener esas empresas también
        if (vacIds.length > 0) {
          const vacs = await this.supabase.cliente
            .from('vacantes')
            .select('id,empresa_id')
            .in('id', vacIds);
          if (!vacs.error && vacs.data) {
            const empresasDeVacantes = Array.from(
              new Set(
                vacs.data
                  .map((v: any) => v.empresa_id)
                  .filter(Boolean)
              )
            );
            
            if (empresasDeVacantes.length > 0) {
              const empresasYaIncluidas = new Set(empIds);
              const empresasNuevas = empresasDeVacantes.filter(
                (eid: string) => !empresasYaIncluidas.has(eid)
              );
              
              if (empresasNuevas.length > 0) {
                console.log('Cargando empresas adicionales de vacantes:', empresasNuevas);
                const empRes = await this.supabase.cliente
                  .from('empresas')
                  .select(
                    'id,auth_user_id,razon_social,correo_corporativo,ciudad,sector,logo_url'
                  )
                  .in('id', empresasNuevas);
                if (!empRes.error && empRes.data) {
                  contactos.push(...empRes.data.map((emp: any) => ({
          ...emp,
          auth_user_id: emp.auth_user_id,
          tipo: 'empresa',
                  })));
                }
              }
            }
          }
        }
        
        // Eliminar duplicados basándose en auth_user_id
        const contactosUnicos = new Map();
        for (const contacto of contactos) {
          const key = contacto.auth_user_id || contacto.id;
          if (key && !contactosUnicos.has(key)) {
            contactosUnicos.set(key, contacto);
          }
        }
        
        this.cuentas = Array.from(contactosUnicos.values());
        console.log('Contactos finales cargados para persona:', this.cuentas.length, this.cuentas);
      }
      
      // Cargar conteos de mensajes no leídos para cada contacto
      await this.cargarConteosMensajesNoLeidos();
    } catch (error: any) {
      console.error('Error en cargarCuentas:', error);
      this.cuentas = [];
    }
  }

  async cargarConteosMensajesNoLeidos() {
    if (!this.usuarioId || !this.cuentas.length) return;
    
    try {
      // Obtener todas las conversaciones en paralelo
      const promesasConversaciones = this.cuentas.map(async (cuenta) => {
        const contactoId = cuenta.auth_user_id || cuenta.id;
        if (!contactoId) return { cuenta, conversacionId: null };
        
        const conversacionId = await this.chat.obtenerConversacionEntre(
          this.usuarioId!,
          contactoId
        );
        return { cuenta, conversacionId };
      });

      const resultados = await Promise.all(promesasConversaciones);
      const conversacionesMap = new Map<string, string>();
      const cuentasPorConversacion = new Map<string, any[]>();

      for (const resultado of resultados) {
        if (resultado.conversacionId) {
          conversacionesMap.set(resultado.cuenta.auth_user_id || resultado.cuenta.id, resultado.conversacionId);
          if (!cuentasPorConversacion.has(resultado.conversacionId)) {
            cuentasPorConversacion.set(resultado.conversacionId, []);
          }
          cuentasPorConversacion.get(resultado.conversacionId)!.push(resultado.cuenta);
        } else {
          resultado.cuenta.mensajesNoLeidos = 0;
        }
      }

      // Contar mensajes no leídos para todas las conversaciones en una sola operación optimizada
      const conversacionIds = Array.from(conversacionesMap.values());
      if (conversacionIds.length > 0) {
        const conteosMap = await this.chat.contarMensajesNoLeidosPorConversaciones(
          this.usuarioId,
          conversacionIds
        );

        // Asignar conteos a las cuentas
        for (const [contactoId, conversacionId] of conversacionesMap.entries()) {
          const cuenta = this.cuentas.find(c => (c.auth_user_id || c.id) === contactoId);
          if (cuenta) {
            cuenta.mensajesNoLeidos = conteosMap.get(conversacionId) || 0;
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar conteos de mensajes:', error);
      // En caso de error, establecer todos a 0
      for (const cuenta of this.cuentas) {
        cuenta.mensajesNoLeidos = 0;
      }
    }
  }

  async iniciarChatCon(destId: string) {
    const u = await this.supabase.cliente.auth.getUser();
    const uid = u.data.user?.id;
    if (!uid) return;
    const convId = await this.chat.crearConversacion(uid, destId);
    this.conversacionSeleccionada = convId;
    this.mensajes = await this.chat.listarMensajes(convId);
    this.conversaciones = await this.chat.listarConversaciones(uid);
  }

  get cuentasFiltradas() {
    return this.cuentas.filter((c: any) => {
      if (this.tipoListado === 'personas') {
        return c.tipo === 'persona';
      } else {
        return c.tipo === 'empresa';
      }
    });
  }

  async abrirMensajes(contacto: any) {
    const destino = contacto?.auth_user_id || contacto?.id;
    if (!destino) return;
    this.router.navigate(['/mensajes', destino], {
      state: { contacto },
    });
  }

  ionViewWillEnter() {
    // Recargar conteos cuando se regrese a esta página (sin await para que sea inmediato)
    if (this.usuarioId) {
      this.cargarConteosMensajesNoLeidos().catch(err => 
        console.error('Error al recargar conteos:', err)
      );
    }
  }

  async cargarSolicitudesCount() {
    if (this.rol === 'empresa') {
      try {
        this.solicitudesCount =
          await this.vacantes.contarPostulacionesPendientesEmpresa();
      } catch {
        this.solicitudesCount = 0;
      }
    }
  }

  async doRefresh(event: any) {
    try {
      if (this.usuarioId) {
        this.conversaciones = await this.chat.listarConversaciones(this.usuarioId);
      }
      await this.cargarSolicitudesCount();
      await this.cargarCuentas();
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      event.target.complete();
    }
  }

  ngOnDestroy() {
    try {
      this.solicitudesCh?.unsubscribe();
    } catch {}
  }
}
