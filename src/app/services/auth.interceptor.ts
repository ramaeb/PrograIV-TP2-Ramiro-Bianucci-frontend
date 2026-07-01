import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TimeTokenService } from './time-token-service'; // Ajustá la ruta según tus carpetas

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const timeTokenService = inject(TimeTokenService);
  const token = localStorage.getItem('token');

  let clonarReq = req;

  if (token) {
    clonarReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. CAPTURAR EL ERROR 401
  return next(clonarReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Interceptor: Token vencido o inválido (401). Forzando cierre...');
        
        // Usamos tu servicio que limpia localStorage, frena el reloj y redirige al login
        timeTokenService.forzarLogout(); 
      }
      return throwError(() => error);
    })
  );
};