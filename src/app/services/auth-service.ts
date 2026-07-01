import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  _id: string;
  email: string;
  username: string;
  perfil: string; 
  token: string; 
  imagenPerfil?: string;
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
  
  login(usuarioOCorreo: string, clave: string): Observable<AuthResponse> {
    const body = { usuarioOCorreo, clave };

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, body).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response));
        this.tipoUsuarioActual = response.perfil; 
        
        // El contador NO SE DISPARA ACÁ. 
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

  private restaurarSesion(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

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
    return !!localStorage.getItem('token');
  }
}