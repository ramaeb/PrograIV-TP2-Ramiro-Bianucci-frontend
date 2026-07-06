import { Routes } from '@angular/router';
import { PaginaCarga } from './pantallas/pagina-carga/pagina-carga';
import { authGuard, publicGuard } from './guards/auth-guard'; // Importamos los nuevos guards
import { adminGuard } from './guards/adminguard-guard';

export const routes: Routes = [
  { path: '', component: PaginaCarga }, 
  {
    path: 'login',
    canActivate: [publicGuard], 
    loadComponent: () => import('./pantallas/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    canActivate: [publicGuard],
    loadComponent: () => import('./pantallas/registro/registro').then(m => m.Registro)
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard], 
    loadComponent: () => import('./pantallas/mi-perfil/mi-perfil').then(m => m.MiPerfil)
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard], 
    loadComponent: () => import('./pantallas/publicaciones/publicaciones').then(m => m.Publicaciones)
  },
  {
  path: 'dashboard/usuarios',
  canActivate: [authGuard, adminGuard], // Debe estar logueado Y ser admin
  loadComponent: () => import('./pantallas/dashboard-usuarios/dashboard-usuarios').then(m => m.DashboardUsuarios)
},
 {
    path: 'dashboard/estadisticas',
    canActivate: [authGuard,adminGuard], 
    loadComponent: () => import('./pantallas/estadisticas/estadisticas').then(m => m.DashboardEstadisticas)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];