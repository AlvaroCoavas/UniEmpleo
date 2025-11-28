import { Injectable } from '@angular/core';
import { loadScript } from '@paypal/paypal-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServicioPayPal {
  private paypal: any = null;

  constructor() {
    this.inicializarPayPal();
  }

  async inicializarPayPal() {
    try {
      this.paypal = await loadScript({
        clientId: environment.paypal.clientId,
        currency: 'USD',
      });
    } catch (error) {
      console.error('Error al cargar PayPal:', error);
    }
  }

  async crearOrdenEnServidor(tipo: 'uso_inmediato' | 'mensual', monto: number, descripcion: string): Promise<string> {
    // Crear orden usando la API de PayPal
    try {
      const auth = btoa(`${environment.paypal.clientId}:${environment.paypal.clientSecret}`);
      const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              description: descripcion,
              amount: {
                currency_code: 'USD',
                value: monto.toString(),
              },
            },
          ],
          application_context: {
            brand_name: 'Uniempleo',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${window.location.origin}/pago-exitoso`,
            cancel_url: `${window.location.origin}/suscripcion?cancelado=true`,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al crear orden: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error: any) {
      console.error('Error al crear orden en servidor:', error);
      throw error;
    }
  }

  async renderizarBoton(
    contenedorId: string,
    tipo: 'uso_inmediato' | 'mensual',
    monto: number,
    descripcion: string,
    onApprove: (data: any, actions: any) => Promise<void>,
    onCancel: () => void,
    onError: (err: any) => void
  ) {
    if (!this.paypal) {
      await this.inicializarPayPal();
    }

    if (!this.paypal) {
      throw new Error('PayPal no se pudo inicializar');
    }

    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) {
      throw new Error(`Contenedor ${contenedorId} no encontrado`);
    }

    // Limpiar contenedor antes de renderizar
    contenedor.innerHTML = '';

    this.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
      },
      createOrder: async () => {
        try {
          const orderId = await this.crearOrdenEnServidor(tipo, monto, descripcion);
          return orderId;
        } catch (error) {
          console.error('Error al crear orden:', error);
          throw error;
        }
      },
      onApprove: async (data: any, actions: any) => {
        try {
          await onApprove(data, actions);
        } catch (error) {
          console.error('Error en onApprove:', error);
          onError(error);
        }
      },
      onCancel: () => {
        onCancel();
      },
      onError: (err: any) => {
        console.error('Error de PayPal:', err);
        onError(err);
      },
    }).render(`#${contenedorId}`);
  }

  async capturarPago(orderId: string) {
    try {
      const auth = btoa(`${environment.paypal.clientId}:${environment.paypal.clientSecret}`);
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Prefer': 'return=representation',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al capturar pago: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al capturar pago:', error);
      throw error;
    }
  }

  async verificarPago(orderId: string) {
    try {
      const auth = btoa(`${environment.paypal.clientId}:${environment.paypal.clientSecret}`);
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al verificar pago: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al verificar pago:', error);
      throw error;
    }
  }
}

