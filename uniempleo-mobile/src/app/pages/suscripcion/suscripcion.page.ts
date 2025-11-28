import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioPayPal } from '../../services/paypal.service';

@Component({
  selector: 'app-suscripcion',
  templateUrl: './suscripcion.page.html',
  styleUrls: ['./suscripcion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PaginaSuscripcion implements OnInit, AfterViewInit, OnDestroy {
  tipoSeleccionado: 'inmediato' | 'mensual' = 'mensual';
  rol?: 'empresa' | 'egresado';
  redireccionarA?: string;
  paypalCargado = false;
  botonPayPalRenderizado = false;

  constructor(
    private supabase: ServicioDatosSupabase,
    private router: Router,
    private route: ActivatedRoute,
    private alertas: AlertController,
    private paypal: ServicioPayPal
  ) {}

  async ngOnInit() {
    // Verificar si el pago fue cancelado
    const cancelado = this.route.snapshot.queryParamMap.get('cancelado');
    if (cancelado === 'true') {
      const alerta = await this.alertas.create({
        header: 'Pago cancelado',
        message: 'El pago no fue procesado. Puedes intentar nuevamente cuando estés listo.',
        buttons: ['OK'],
      });
      await alerta.present();
    }

    // Obtener el rol actual
    this.rol = (await this.supabase.obtenerRolActual()) as any;
    
    // Obtener la ruta de redirección desde query params
    this.redireccionarA = this.route.snapshot.queryParamMap.get('redirect') || undefined;
  }

  async ngAfterViewInit() {
    // Esperar un poco para que el DOM esté listo
    setTimeout(() => {
      this.renderizarBotonPayPal();
    }, 500);
  }

  ngOnDestroy() {
    // Limpiar si es necesario
  }

  async renderizarBotonPayPal() {
    if (this.botonPayPalRenderizado) return;

    try {
      const monto = this.tipoSeleccionado === 'inmediato' ? 5 : 20;
      const descripcion = this.tipoSeleccionado === 'inmediato' 
        ? 'Uniempleo PRO - Uso Inmediato' 
        : 'Uniempleo PRO - Suscripción Mensual';

      await this.paypal.renderizarBoton(
        'paypal-button-container',
        this.tipoSeleccionado === 'inmediato' ? 'uso_inmediato' : 'mensual',
        monto,
        descripcion,
        async (data: any, actions: any) => {
          return await this.onApprovePayPal(data, actions);
        },
        () => {
          this.onCancelPayPal();
        },
        (err: any) => {
          this.onErrorPayPal(err);
        }
      );

      this.botonPayPalRenderizado = true;
    } catch (error) {
      console.error('Error al renderizar botón PayPal:', error);
    }
  }

  async onApprovePayPal(data: any, actions: any) {
    try {
      // Capturar el pago usando actions.order.capture() que es el método estándar de PayPal
      const detalles = await actions.order.capture();
      
      if (!detalles || detalles.status !== 'COMPLETED') {
        throw new Error('El pago no fue completado correctamente.');
      }

      const orderId = detalles.id;
      const payerId = detalles.payer?.payer_id;
      // Obtener monto de la captura o del purchase unit
      const monto = parseFloat(
        detalles.purchase_units[0]?.payments?.captures[0]?.amount?.value || 
        detalles.purchase_units[0]?.amount?.value || 
        '0'
      );
      const tipoSuscripcion = this.tipoSeleccionado === 'inmediato' ? 'uso_inmediato' : 'mensual';

      // Obtener usuario actual
      const usuario = await this.supabase.cliente.auth.getUser();
      const authUserId = usuario.data.user?.id;
      if (!authUserId) {
        throw new Error('No se pudo obtener la información del usuario.');
      }

      // Obtener datos del usuario según su rol
      let usuarioId: string;
      let usuarioTipo: 'persona' | 'empresa';

      if (this.rol === 'empresa') {
        const empresa = await this.supabase.obtenerEmpresaActual();
        if (!empresa?.id) {
          throw new Error('No se encontró la empresa actual.');
        }
        usuarioId = empresa.id;
        usuarioTipo = 'empresa';
      } else {
        const persona = await this.supabase.obtenerPersonaActual();
        if (!persona?.id) {
          throw new Error('No se encontró la persona actual.');
        }
        usuarioId = persona.id;
        usuarioTipo = 'persona';
      }

      // Registrar transacción en la base de datos
      const { error: transError } = await this.supabase.cliente
        .from('transacciones_pago')
        .insert({
          usuario_tipo: usuarioTipo,
          usuario_id: usuarioId,
          tipo_suscripcion: tipoSuscripcion,
          monto: monto,
          moneda: 'USD',
          order_id: orderId,
          payer_id: payerId,
          estado: 'completado',
          detalles_pago: detalles,
        });

      if (transError) {
        console.error('Error al registrar transacción:', transError);
        // Continuar aunque falle el registro de transacción
      }

      // Procesar según el tipo de suscripción
      if (tipoSuscripcion === 'uso_inmediato') {
        // Uso inmediato: mantener suscripcion = false, redirigir a publicar
        const ruta = this.redireccionarA || (this.rol === 'empresa' ? '/publicar-vacante' : '/publicar-servicio');
        this.router.navigate(['/pago-exitoso'], {
          queryParams: {
            orderId: orderId,
            tipo: tipoSuscripcion,
            monto: monto,
            redirect: ruta,
          },
        });
      } else {
        // Mensual: actualizar suscripcion = true, fecha_vencimiento = NOW() + 30 días
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

        if (usuarioTipo === 'empresa') {
          await this.supabase.cliente
            .from('empresas')
            .update({
              suscripcion: true,
              fecha_vencimiento_suscripcion: fechaVencimiento.toISOString(),
            })
            .eq('id', usuarioId);
        } else {
          await this.supabase.cliente
            .from('personas')
            .update({
              suscripcion: true,
              fecha_vencimiento_suscripcion: fechaVencimiento.toISOString(),
            })
            .eq('id', usuarioId);
        }

        // Redirigir a página de éxito
        this.router.navigate(['/pago-exitoso'], {
          queryParams: {
            orderId: orderId,
            tipo: tipoSuscripcion,
            monto: monto,
            redirect: '/pestanas/tab1',
          },
        });
      }
    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      const alerta = await this.alertas.create({
        header: 'Error en el pago',
        message: error?.message || 'No se pudo procesar el pago. Por favor, intenta nuevamente.',
        buttons: ['OK'],
      });
      await alerta.present();
      // Redirigir al feed en caso de error
      this.router.navigateByUrl('/pestanas/tab1');
    }
  }

  onCancelPayPal() {
    const alerta = this.alertas.create({
      header: 'Pago cancelado',
      message: 'El pago no fue procesado. Puedes intentar nuevamente cuando estés listo.',
      buttons: ['OK'],
    });
    alerta.then(a => a.present());
    // Redirigir al feed
    this.router.navigateByUrl('/pestanas/tab1');
  }

  onErrorPayPal(err: any) {
    console.error('Error de PayPal:', err);
    const alerta = this.alertas.create({
      header: 'Error en el pago',
      message: 'Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.',
      buttons: ['OK'],
    });
    alerta.then(a => a.present());
    // Redirigir al feed
    this.router.navigateByUrl('/pestanas/tab1');
  }

  async cambiarTipo() {
    // Re-renderizar botón cuando cambia el tipo
    this.botonPayPalRenderizado = false;
    const contenedor = document.getElementById('paypal-button-container');
    if (contenedor) {
      contenedor.innerHTML = '';
    }
    setTimeout(() => {
      this.renderizarBotonPayPal();
    }, 100);
  }

  cerrar() {
    const ruta = this.redireccionarA || '/pestanas/tab1';
    this.router.navigateByUrl(ruta);
  }
}

