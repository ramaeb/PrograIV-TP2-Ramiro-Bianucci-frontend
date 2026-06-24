import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Definimos una interfaz rápida para el tipado de la respuesta del backend
interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string;
    username?: string;
    tipoUsuario: string; // 'admin' o 'usuario'
    imagenUrl?: string;  // <--- Agregamos la URL que guardó NestJS/Cloudinary/etc.
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  //nestjs
  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com'; 
  public tipoUsuarioActual = signal<string | null>(null);

  constructor() {
    this.restaurarSesion();
  }

  //login nestjs    
  login(identifier: string, clave: string): Observable<AuthResponse> {
    const body = { identifier, clave };

    // Hacemos el POST a NestJS. Usamos 'tap' para ejecutar lógica intermedia al recibir la respuesta con éxito
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap(response => {
        // 1. Guardamos el JWT en el localStorage
        localStorage.setItem('token', response.token);
        // 2. Guardamos los datos del usuario en formato string si los necesitamos después
        localStorage.setItem('usuario', JSON.stringify(response.user));
        
        // 3. Actualizamos el Signal con el rol ('tipoUsuario') que vino de MongoDB
        this.tipoUsuarioActual.set(response.user.tipoUsuario);
        console.log('Sesión iniciada en NestJS. Rol:', this.tipoUsuarioActual());
      })
    );
  }

  /**
   * Registro contra tu servidor NestJS
    */
    registrarUsuario(formD: FormData): Observable<any> {
        // El HttpClient de Angular detecta el FormData y setea el boundary correcto por sí solo.
        return this.http.post(`${this.apiUrl}/registro`, formD);
      }

  /**
   * Cierre de sesión local
   */
  logout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      this.tipoUsuarioActual.set(null);
      this.router.navigate(['/login']);
    }
  /**
   * Método auxiliar para no perder el estado del Signal si el usuario refresca la pantalla (F5)
   */
  private restaurarSesion(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (token && usuarioGuardado) {
      try {
        const user = JSON.parse(usuarioGuardado);
        this.tipoUsuarioActual.set(user.tipoUsuario);
        console.log('Sesión restaurada desde localStorage. Rol:', this.tipoUsuarioActual());
      } catch (e) {
        this.logout(); // Si el JSON está corrupto, deslogueamos por seguridad
      }
    }
  }

  /**
   * Getter rápido para saber si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}