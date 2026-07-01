import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service'; 
import { TimeTokenService } from '../services/time-token-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const timeTokenService = inject(TimeTokenService);

  if (authService.isAuthenticated()) {
    return true; // Dejar pasar a la ruta privada
  }

  console.warn('AuthGuard: Intento de acceso no autorizado. Redirigiendo al login...');
  timeTokenService.limpiarContador(); // limpiar cualquier rastro de timers
  return router.createUrlTree(['/login']); // Redirigir 
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true; // Dejar pasar al login/registro
  }

  console.log('PublicGuard: El usuario ya tiene sesión activa. Redirigiendo al feed...');
  return router.createUrlTree(['/publicaciones']);
};