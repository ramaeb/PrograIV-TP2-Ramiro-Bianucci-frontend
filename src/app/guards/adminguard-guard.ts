import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { ErrorAlert } from '../utils/sweetAlert';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si está logueado Y si su perfil es 'admin'
  if (authService.isAuthenticated() && authService.tipoUsuarioActual === 'admin') {
    return true;
  }

  console.warn('Access denied: Requires Administrator profile.');
  ErrorAlert.fire({
    title: 'Acceso Denegado',
    text: 'No tenés permisos de administrador para ver esta sección.'
  });

  return router.createUrlTree(['/publicaciones']); // Lo desviamos al feed común
};