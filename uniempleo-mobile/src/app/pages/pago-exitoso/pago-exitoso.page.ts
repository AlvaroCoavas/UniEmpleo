import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-pago-exitoso',
  templateUrl: './pago-exitoso.page.html',
  styleUrls: ['./pago-exitoso.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PaginaPagoExitoso implements OnInit {
  orderId?: string;
  tipo?: string;
  monto?: number;
  redirectUrl?: string;
  nombreProducto: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: ServicioDatosSupabase
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') || undefined;
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') || undefined;
    const montoStr = this.route.snapshot.queryParamMap.get('monto');
    this.monto = montoStr ? parseFloat(montoStr) : undefined;
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || '/pestanas/tab1';

    // Determinar nombre del producto
    if (this.tipo === 'uso_inmediato') {
      this.nombreProducto = 'Uniempleo PRO - Uso Inmediato';
    } else if (this.tipo === 'mensual') {
      this.nombreProducto = 'Uniempleo PRO - Suscripción Mensual';
    } else {
      this.nombreProducto = 'Producto Uniempleo PRO';
    }
  }

  continuar() {
    this.router.navigateByUrl(this.redirectUrl || '/pestanas/tab1');
  }
}

