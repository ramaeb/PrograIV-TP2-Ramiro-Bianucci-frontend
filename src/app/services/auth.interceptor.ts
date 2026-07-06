import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TimeTokenService } from './time-token-service'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const timeTokenService = inject(TimeTokenService);
  const token = localStorage.getItem('token');

  let clonarReq = req;

  // 1. Añadimos el token a todas las peticiones salientes
  if (token) {
    clonarReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonarReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 2. Si hay un 401, filtramos para NO entrar en bucle si la que falló fue la de login o la de refrescar
      if (
        error.status === 401 && 
        !req.url.includes('/auth/login') && 
        !req.url.includes('/auth/refrescar') &&
        !req.url.includes('/auth/validar')
      ) {
        console.warn('Interceptor: Token vencido (401). Intentando refrescar automáticamente...');

        // 3. Llamamos al método de refrescar de tu servicio
        // (Asegurate de tener la función refrescarToken() en tu servicio que le pegue a /auth/refrescar)
        return timeTokenService.refrescarToken().pipe(
          switchMap((res: any) => {
            console.log('Interceptor: ¡Token refrescado con éxito!');
            
            // Re-clonamos la petición original que había fallado, pero con la NUEVA firma
            const nuevaReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`
              }
            });
            
            // Volvemos a lanzar la petición original. Para el usuario es transparente.
            return next(nuevaReq);
          }),
          catchError((refreshError) => {
            // 4. Si el propio refresh falla con 401 (firma rota o expiración absoluta), ahí sí forzamos logout
            console.error('Interceptor: No se pudo refrescar el token. Forzando cierre...');
            timeTokenService.forzarLogout();
            return throwError(() => refreshError);
          })
        );
      }

      // Si es un 401 de login/refresh o cualquier otro error (400, 500), pasa de largo
      return throwError(() => error);
    })
  );
};