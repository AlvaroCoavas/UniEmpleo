import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class PaginaRecuperarContrasena implements OnInit, OnDestroy {
  formulario!: FormGroup;
  token?: string;
  cargando = false;
  mensajeError: string | undefined = undefined;
  private authSubscription?: { data: { subscription: { unsubscribe: () => void } } } | null;

  constructor(
    private fb: FormBuilder,
    private supabase: ServicioDatosSupabase,
    private router: Router,
    private route: ActivatedRoute,
    private alertas: AlertController
  ) {
    this.formulario = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]],
    }, { validators: this.coincidenContrasenas });
  }

  async ngOnInit() {
    // Escuchar cambios en el estado de autenticación de Supabase
    // Esto puede capturar la sesión cuando Supabase procesa el hash automáticamente
    const authStateChange = this.supabase.cliente.auth.onAuthStateChange(async (event, session) => {
      console.log('Cambio en estado de autenticación:', event, session?.user?.id);
      
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('Sesión de recuperación de contraseña detectada automáticamente');
        // Limpiar el hash de la URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
    
    this.authSubscription = authStateChange as any;

    // Supabase envía el token en el hash de la URL (#access_token=...&type=recovery)
    const hash = window.location.hash;
    console.log('Hash de URL completo:', hash);
    console.log('URL completa:', window.location.href);
    
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      console.log('Token encontrado en hash:', { 
        hasAccessToken: !!accessToken, 
        type, 
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      });

      // Si es un token de recuperación, establecer la sesión automáticamente
      if (accessToken && type === 'recovery') {
        try {
          console.log('Estableciendo sesión con token de recuperación...');
          const { data: sessionData, error: sessionError } = await this.supabase.cliente.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('Error al establecer sesión con token de recuperación:', sessionError);
            console.error('Detalles del error:', {
              message: sessionError.message,
              status: sessionError.status,
              name: sessionError.name
            });
            this.mensajeError = `El enlace de recuperación ha expirado o es inválido. Error: ${sessionError.message}`;
            const alerta = await this.alertas.create({
              header: 'Error',
              message: this.mensajeError,
              buttons: ['OK'],
            });
            await alerta.present();
            return;
          }

          console.log('Sesión establecida correctamente:', {
            userId: sessionData?.user?.id,
            email: sessionData?.user?.email,
            hasSession: !!sessionData?.session
          });
          
          // Limpiar el hash de la URL para que no se vea el token
          window.history.replaceState(null, '', window.location.pathname);
        } catch (error: any) {
          console.error('Error al procesar token de recuperación:', error);
          this.mensajeError = `Error al procesar el enlace de recuperación: ${error?.message || 'Error desconocido'}`;
        }
      } else {
        // Obtener todos los parámetros del hash para debug
        const allParams: Record<string, string> = {};
        params.forEach((value, key) => {
          allParams[key] = value;
        });
        console.warn('Hash encontrado pero no es un token de recuperación válido:', { 
          accessToken: !!accessToken, 
          type,
          allParams
        });
      }
    } else {
      console.log('No se encontró hash en la URL');
      // Verificar si ya hay una sesión activa
      const { data: { user } } = await this.supabase.cliente.auth.getUser();
      if (user) {
        console.log('Usuario ya tiene sesión activa:', user.id);
      }
    }

    // También verificar query params por si acaso
    this.token = this.route.snapshot.queryParamMap.get('token') || 
                 this.route.snapshot.queryParamMap.get('access_token') || 
                 undefined;
    
    if (this.token) {
      console.log('Token encontrado en query params');
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.data.subscription.unsubscribe();
    }
  }

  coincidenContrasenas(group: FormGroup) {
    const nueva = group.get('nuevaContrasena')?.value;
    const confirmar = group.get('confirmarContrasena')?.value;
    return nueva === confirmar ? null : { noCoinciden: true };
  }

  async cambiarContrasena() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = undefined;

    try {
      const { nuevaContrasena } = this.formulario.value;

      // Verificar que el usuario tenga una sesión activa (establecida en ngOnInit)
      let usuario = await this.supabase.cliente.auth.getUser();
      console.log('Usuario actual antes de actualizar contraseña:', usuario.data.user?.id);
      
      if (!usuario.data.user) {
        // Si no hay sesión, intentar establecerla desde el hash
        const hash = window.location.hash;
        console.log('No hay sesión, intentando establecer desde hash:', hash);
        
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && type === 'recovery') {
            console.log('Estableciendo sesión desde hash...');
            const { data: sessionData, error: sessionError } = await this.supabase.cliente.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Error al establecer sesión:', sessionError);
              throw new Error(`El enlace de recuperación ha expirado o es inválido. Error: ${sessionError.message}`);
            }

            console.log('Sesión establecida desde hash:', sessionData);
            
            // Verificar nuevamente
            usuario = await this.supabase.cliente.auth.getUser();
          } else {
            throw new Error('No se encontró un token de recuperación válido en el enlace. Solicita uno nuevo.');
          }
        } else {
          throw new Error('No hay sesión activa. Usa el enlace de recuperación que se envió a tu correo. Asegúrate de hacer clic en el enlace completo del correo.');
        }
      }

      // Verificar nuevamente que ahora tenemos sesión
      if (!usuario.data.user) {
        throw new Error('No se pudo establecer la sesión. El enlace puede haber expirado o ser inválido.');
      }

      console.log('Actualizando contraseña para usuario:', usuario.data.user.id);
      
      // Actualizar contraseña
      const { data: updateData, error: updateError } = await this.supabase.cliente.auth.updateUser({
        password: nuevaContrasena,
      });

      if (updateError) {
        console.error('Error al actualizar contraseña:', updateError);
        throw new Error(updateError.message || 'No se pudo actualizar la contraseña. Intenta nuevamente.');
      }

      console.log('Contraseña actualizada correctamente:', updateData);

      const alerta = await this.alertas.create({
        header: 'Éxito',
        message: 'Tu contraseña ha sido actualizada correctamente.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.router.navigateByUrl('/inicio-sesion');
            },
          },
        ],
      });
      await alerta.present();
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      this.mensajeError = error?.message || 'No se pudo actualizar la contraseña. Verifica que el enlace no haya expirado.';
      
      const alerta = await this.alertas.create({
        header: 'Error',
        message: this.mensajeError,
        buttons: ['OK'],
      });
      await alerta.present();
    } finally {
      this.cargando = false;
    }
  }
}

