import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Toast } from '../utils/sweetAlert';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs'; 
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth-service'; 
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class TimeTokenService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService); 
  private segundosRestantes$ = new BehaviorSubject<number>(0);
  public tiempoVisual$ = this.segundosRestantes$.asObservable().pipe(
    map(segundos => this.formatearTiempo(segundos))
  );

  private cuentaRegresivaSub?: Subscription;
  private timerModalSub?: Subscription;

  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/auth/refrescar';

iniciarContador() {
    
    this.cuentaRegresivaSub?.unsubscribe();
    this.timerModalSub?.unsubscribe();

    const diezMinutosEnMiliseg = 10 * 60 * 1000;
    let tiempoExpiracion = localStorage.getItem('fecha_expiracion_contador');

    if (!tiempoExpiracion) {
      const ahora = new Date().getTime();
      tiempoExpiracion = (ahora + diezMinutosEnMiliseg).toString();
      localStorage.setItem('fecha_expiracion_contador', tiempoExpiracion);
    }

    const timestampExpiracion = parseInt(tiempoExpiracion, 10);

    const calcularSegundosRestantes = () => {
      const ahora = new Date().getTime();
      return Math.max(0, Math.floor((timestampExpiracion - ahora) / 1000));
    };

    const segundosIniciales = calcularSegundosRestantes();
    this.segundosRestantes$.next(segundosIniciales);

    console.log(`Contador sincronizado. Quedan ${segundosIniciales} segundos.`);

    this.cuentaRegresivaSub = timer(0, 1000).subscribe(() => {
      const segundosActuales = calcularSegundosRestantes();
      this.segundosRestantes$.next(segundosActuales);

      if (segundosActuales <= 0) {
        this.limpiarContador(); 
        this.mostrarModalExpiracion();
      }
    });
  }
  
  limpiarContador() {
    this.cuentaRegresivaSub?.unsubscribe();
    this.timerModalSub?.unsubscribe();
    this.segundosRestantes$.next(0);
    localStorage.removeItem('fecha_expiracion_contador'); 
  }

  private mostrarModalExpiracion() {
    Swal.fire({
      title: '¿Seguís ahí?',
      text: 'Tu sesión va a expirar en 5 minutos por seguridad. ¿Querés extenderla?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',  
      confirmButtonText: 'Sí, mantener sesión',
      cancelButtonText: 'No, salir',
      allowOutsideClick: false 
    }).then((result) => {
      if (result.isConfirmed) {
        this.refrescarToken();
      } else {
        this.forzarLogout();
      }
    });
  }

   refrescarToken(): Observable<any> { 
  const tokenViejo = localStorage.getItem('token');
  
  // Enviar el token viejo en el Body como pide la consigna de tu ruta POST
  const body = { token: tokenViejo }; 

 //return
  return this.http.post<any>(this.apiUrl, body).pipe(
    tap({
      next: (res) => {
        if (res.token || res.accessToken) {
          const nuevoToken = res.token || res.accessToken;
          localStorage.setItem('token', nuevoToken);
          
          Toast.fire({ icon: 'success', title: 'Sesión extendida con éxito.' });
          this.iniciarContador();
        }
      },
      error: (err) => {
        console.error('Error al intentar refrescar el token:', err);
        this.forzarLogout();
      }
    })
  );
}

  forzarLogout() {
    this.limpiarContador();          
    this.authService.logout();       
    Toast.fire({ icon: 'info', title: 'Sesión finalizada por inactividad.' });
  }

  private formatearTiempo(segundosTotales: number): string {
    if (segundosTotales <= 0) return '00:00';
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }
}