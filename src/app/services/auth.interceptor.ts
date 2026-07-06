import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TimeTokenService } from './time-token-service'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const timeTokenService = inject(TimeTokenService);
  const token = localStorage.getItem('token');

  // 🚀 CANDADO 1 OPTIMIZADO: Excluimos logins, registros, validaciones 
  // Y TAMBIÉN permitimos los métodos GET públicos de perfiles/usuarios para que no se traben con tokens viejos
  if (
    req.url.includes('/auth/login') || 
    req.url.includes('/auth/registro') || 
    req.url.includes('/auth/validar') ||
    (req.method === 'GET' && req.url.includes('/api/usuarios/username/'))
  ) {
    return next(req); // Pasa la request 100% limpia sin headers conflictivos
  }

  let clonarReq = req;

  // 2. Añadimos el token solo a las peticiones operativas (crear posts, dar likes, comentar, etc.)
  if (token) {
    clonarReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonarReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 3. Si hay un 401 en el resto del ecosistema, intentamos refrescar de forma transparente
      if (
        error.status === 401 && 
        !req.url.includes('/auth/refrescar') &&
        !req.url.includes('/auth/login')
      ) {
        console.warn('Interceptor: Token vencido (401). Intentando refrescar automáticamente...');

        return timeTokenService.refrescarToken().pipe(
          switchMap((res: any) => {
            console.log('Interceptor: ¡Token refrescado con éxito!');
            
            const nuevaReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`
              }
            });
            
            return next(nuevaReq);
          }),
          catchError((refreshError) => {
            console.error('Interceptor: No se pudo refrescar el token. Forzando cierre...');
            timeTokenService.forzarLogout();
            return throwError(() => refreshError);
          })
        );
      }

      // Si es un error de otra índole (400, 404 real, 500), se eyecta limpio
      return throwError(() => error);
    })
  );
};