import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Estructura REAL que devuelve tu backend en el Login
interface AuthResponse {
  _id: string;         // Ajustado a lo que tira tu DB (MongoDB utiliza _id)
  email: string;
  username: string;
  perfil: string;      // Viene como 'admin', 'usuario', etc.
  imagenPerfil?: string;
  token: string;
  message?: string;
}

// Estructura de la ruta /auth/validar (Si solo devuelve el payload del token)
interface UsuarioDatos {
  id?: string;
  _id?: string; 
  email: string;
  username: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com'; 
  public tipoUsuarioActual = ""; 
  
  constructor() {
    this.restaurarSesion();
  }

  private guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // 1. LOGIN (POST) - Modificado para aprovechar los datos directos del Backend
  login(usuarioOCorreo: string, clave: string): Observable<AuthResponse> {
    const body = { usuarioOCorreo, clave };

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, body).pipe(
      tap(response => {
        this.guardarToken(response.token);
        
        // Seteamos los datos en memoria con lo que ya nos vino del login
        this.tipoUsuarioActual = response.perfil;
        
        // Guardamos el objeto de usuario completo para tenerlo disponible (imagen, mail, etc.)
        localStorage.setItem('usuario', JSON.stringify(response));
      })
    );
  }

  // 2. VALIDAR POR POST (/auth/validar)
  // Este lo va a usar principalmente tu Interceptor o los Guards cuando se recargue la página
  validarYSetearUsuario(): Observable<UsuarioDatos | null> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return of(null);
    }

    return this.http.post<UsuarioDatos>(`${this.apiUrl}/auth/validar`, { token }).pipe(
      tap(usuario => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.tipoUsuarioActual = usuario.perfil; 
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  refrescarToken(): Observable<{ token: string }> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return throwError(() => new Error('No hay token disponible'));
    }

    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refrescar`, { token }).pipe(
      tap(response => {
        this.guardarToken(response.token); // Renovamos el token por 5 min más
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  registrarUsuario(formD: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro`, formD);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.tipoUsuarioActual = "";
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  private restaurarSesion(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    const token = this.getToken();

    if (token && usuarioGuardado) {
      try {
        const user = JSON.parse(usuarioGuardado);
        this.tipoUsuarioActual = user.perfil;
      } catch (e) {
        this.logout(); 
      }
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}