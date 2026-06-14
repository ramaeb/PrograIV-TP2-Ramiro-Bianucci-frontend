import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    // 🎯 CLAVE: Agregamos el archivo final en la ruta del import string
    loadComponent: () => import('./pantallas/login/login').then(m => m.Login)
  },
   {
    path: 'mi-perfil',
    // 🎯 CLAVE: Agregamos el archivo final en la ruta del import string
    loadComponent: () => import('./pantallas/mi-perfil/mi-perfil').then(m => m.MiPerfil)
  },
   {
    path: 'publicaciones',
    // 🎯 CLAVE: Agregamos el archivo final en la ruta del import string
    loadComponent: () => import('./pantallas/publicaciones/publicaciones').then(m => m.Publicaciones)
  },
   {
    path: 'registro',
    // 🎯 CLAVE: Agregamos el archivo final en la ruta del import string
    loadComponent: () => import('./pantallas/registro/registro').then(m => m.Registro)
  }
];