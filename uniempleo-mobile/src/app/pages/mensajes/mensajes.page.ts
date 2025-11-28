import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioChat } from '../../services/chat.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { Mensaje } from '../../models/mensaje';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.page.html',
  styleUrls: ['./mensajes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, CurrencyFormatPipe],
})
export class PaginaMensajes implements OnInit, OnDestroy {
  mensajes: Mensaje[] = [];
  texto = '';
  conversacionId?: string;
  contactoId?: string;
  contacto: any = null;
  usuarioId?: string;
  modalAbierto: boolean = false;
  perfilCompleto: any = null;
  habilidades: any[] = [];
  private mensajesChannel: any;
  private scrollContainer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chat: ServicioChat,
    private supabase: ServicioDatosSupabase
  ) {}

  async ngOnInit() {
    // Obtener datos del contacto desde el state o parámetros
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || this.route.snapshot.data;
    
    if (state && state['contacto']) {
      this.contacto = state['contacto'];
    }

    // Obtener contactoId de la ruta
    this.contactoId = this.route.snapshot.paramMap.get('id') || undefined;
    
    if (!this.contactoId && this.contacto) {
      this.contactoId = this.contacto.auth_user_id || this.contacto.id;
    }

    if (!this.contactoId) {
      console.error('No se pudo obtener el ID del contacto');
      this.router.navigate(['/chat']);
      return;
    }

    // Obtener usuario actual
    const usuario = await this.supabase.cliente.auth.getUser();
    this.usuarioId = usuario.data.user?.id;

    if (!this.usuarioId) {
      this.router.navigate(['/chat']);
      return;
    }

    // Cargar o crear conversación
    this.conversacionId = await this.chat.crearConversacion(
      this.usuarioId,
      this.contactoId
    );

    if (!this.conversacionId) {
      console.error('No se pudo crear/obtener la conversación');
      return;
    }

    // Cargar mensajes existentes
    await this.cargarMensajes();

    // Marcar mensajes como leídos al abrir la conversación
    if (this.conversacionId && this.usuarioId) {
      const ultimoMensaje = this.mensajes[this.mensajes.length - 1];
      // Marcar como leído inmediatamente sin esperar
      this.chat.marcarMensajesComoLeidos(
        this.usuarioId,
        this.conversacionId,
        ultimoMensaje?.id
      ).catch(err => console.error('Error al marcar como leído:', err));
    }

    // Suscribirse a nuevos mensajes en tiempo real
    this.mensajesChannel = this.chat.suscribirMensajes(
      this.conversacionId,
      (nuevoMensaje) => {
        // Evitar duplicados
        if (!this.mensajes.find((m) => m.id === nuevoMensaje.id)) {
          this.mensajes.push(nuevoMensaje);
          this.scrollToBottom();
          
          // Si el mensaje es del otro usuario, marcarlo como leído automáticamente
          if (nuevoMensaje.senderId !== this.usuarioId && this.conversacionId && this.usuarioId) {
            this.chat.marcarMensajesComoLeidos(
              this.usuarioId,
              this.conversacionId,
              nuevoMensaje.id
            );
          }
        }
      }
    );

    // Si no tenemos datos del contacto, cargarlos
    if (!this.contacto && this.contactoId) {
      await this.cargarDatosContacto();
    }
  }

  async cargarDatosContacto() {
    try {
      // Intentar obtener como persona
      const personaRes = await this.supabase.cliente
        .from('personas')
        .select('id,auth_user_id,nombre_completo,correo,foto_url')
        .eq('auth_user_id', this.contactoId)
        .maybeSingle();

      if (personaRes.data) {
        this.contacto = {
          ...personaRes.data,
          tipo: 'persona',
          nombre: personaRes.data.nombre_completo,
        };
        return;
      }

      // Intentar obtener como empresa
      const empresaRes = await this.supabase.cliente
        .from('empresas')
        .select('id,auth_user_id,razon_social,correo_corporativo,logo_url')
        .eq('auth_user_id', this.contactoId)
        .maybeSingle();

      if (empresaRes.data) {
        this.contacto = {
          ...empresaRes.data,
          tipo: 'empresa',
          nombre: empresaRes.data.razon_social,
        };
        return;
      }
    } catch (error) {
      console.error('Error al cargar datos del contacto:', error);
    }
  }

  async cargarMensajes() {
    if (!this.conversacionId) return;
    try {
      this.mensajes = await this.chat.listarMensajes(this.conversacionId);
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }

  async enviarMensaje() {
    if (!this.texto.trim() || !this.conversacionId || !this.usuarioId) return;

    const mensaje: Omit<Mensaje, 'id'> = {
      senderId: this.usuarioId,
      text: this.texto.trim(),
      createdAt: Date.now(),
    };

    try {
      await this.chat.enviarMensaje(this.conversacionId, mensaje);
      this.texto = '';
      // El mensaje se agregará automáticamente vía la suscripción en tiempo real
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  }

  esMio(mensaje: Mensaje): boolean {
    return mensaje.senderId === this.usuarioId;
  }

  formatearFecha(timestamp: number): string {
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const content = document.querySelector('ion-content');
      if (content) {
        content.scrollToBottom(300);
      }
    }, 100);
  }

  async abrirPerfil() {
    if (!this.contactoId) return;
    
    this.modalAbierto = true;
    
    try {
      // Intentar usar la función de base de datos primero (evita problemas de RLS)
      try {
        const funcionResult = await this.supabase.cliente.rpc('obtener_perfil_completo_por_auth_user_id', {
          p_auth_user_id: this.contactoId
        });
        
        if (!funcionResult.error && funcionResult.data) {
          this.perfilCompleto = funcionResult.data;
          
          // Si es persona, cargar habilidades
          if (this.perfilCompleto.tipo === 'persona' && this.perfilCompleto.id) {
            const habilidadesRes = await this.supabase.cliente
              .from('personas_habilidades')
              .select('nivel, habilidad:habilidad_id(id,nombre)')
              .eq('persona_id', this.perfilCompleto.id);
            this.habilidades = (habilidadesRes.data || []) as any[];
          } else {
            this.habilidades = [];
          }
          return;
        }
      } catch (funcionError: any) {
        console.warn('Error al usar función de base de datos, usando método directo:', funcionError);
      }
      
      // Fallback: método directo (puede tener problemas de RLS)
      // Intentar cargar como persona
      const personaRes = await this.supabase.cliente
        .from('personas')
        .select('id,auth_user_id,nombre_completo,tipo_documento,numero_documento,correo,telefono,ciudad,rol_principal,anos_experiencia,pretension_salarial,disponibilidad,resumen,hoja_vida_url,foto_url,verificado')
        .eq('auth_user_id', this.contactoId)
        .maybeSingle();

      if (personaRes.data) {
        this.perfilCompleto = personaRes.data;
        this.perfilCompleto.tipo = 'persona';
        
        // Cargar habilidades
        const habilidadesRes = await this.supabase.cliente
          .from('personas_habilidades')
          .select('nivel, habilidad:habilidad_id(id,nombre)')
          .eq('persona_id', personaRes.data.id);
        this.habilidades = (habilidadesRes.data || []) as any[];
        return;
      }

      // Intentar cargar como empresa
      const empresaRes = await this.supabase.cliente
        .from('empresas')
        .select('id,auth_user_id,razon_social,nit,representante_legal,correo_corporativo,telefono,ciudad,sector,tamano,sitio_web,logo_url,documento_verificacion_url,descripcion,verificado')
        .eq('auth_user_id', this.contactoId)
        .maybeSingle();

      if (empresaRes.data) {
        this.perfilCompleto = empresaRes.data;
        this.perfilCompleto.tipo = 'empresa';
        this.habilidades = [];
        return;
      }

      // Si no se encuentra, usar los datos básicos del contacto
      this.perfilCompleto = this.contacto;
      this.habilidades = [];
    } catch (error) {
      console.error('Error al cargar perfil completo:', error);
      this.perfilCompleto = this.contacto;
      this.habilidades = [];
    }
  }

  cerrarPerfil() {
    this.modalAbierto = false;
    this.perfilCompleto = null;
    this.habilidades = [];
  }

  ngOnDestroy() {
    try {
      if (this.mensajesChannel) {
        this.mensajesChannel.unsubscribe();
      }
    } catch (error) {
      console.error('Error al desuscribirse:', error);
    }
  }
}
