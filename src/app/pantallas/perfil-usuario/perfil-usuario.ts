import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { PublicacionComponent } from '../publicacion/publicacion'; 

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, PublicacionComponent],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuario implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(AuthService); // 🚀 Usado en el HTML para dar permisos de Admin

  private baseUsuariosUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/api/usuarios';
  private basePublicacionesUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/publicaciones/';

  usuarioData: any = null;
  ultimasPublicaciones: any[] = [];
  errorPublicaciones: string = '';
  cargando: boolean = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.obtenerDatosPerfil(username);
      }
    });
  }

  obtenerDatosPerfil(username: string) {
    this.cargando = true;
    
    // Consultamos al endpoint de la API de usuarios usando el método custom por username
    this.http.get<any>(`${this.baseUsuariosUrl}/username/${username}`).subscribe({
      next: (user) => {
        this.usuarioData = user;
        
        // 🚀 Verificación de Coincidencia de Sesión:
        const miUsuarioLocal = localStorage.getItem('usuario');
        if (miUsuarioLocal) {
          const miUser = JSON.parse(miUsuarioLocal);
          // Macheamos usando tu propiedad '_id' provista en el login
          if (miUser._id === user._id) {
            this.router.navigate(['/mi-perfil']);
            return;
          }
          this.http.patch(`${this.baseUsuariosUrl}/${user._id}/registrar-visita`, {}).subscribe();
        }
        
        // Si es otro usuario, gatillamos tu query de publicaciones limitando a 3 por consigna
        this.obtenerPublicaciones(user._id);
      },
      error: (err) => {
        console.error('Error al traer perfil por username:', err);
        this.cargando = false;
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  obtenerPublicaciones(usuarioId: string) {
    // 🚀 Consumimos tu endpoint con tus query params idénticos a los de MiPerfil
    const url = `${this.basePublicacionesUrl}?usuarioId=${usuarioId}&orden=fecha&limit=3&offset=0`;
    
    this.http.get<any[]>(url).subscribe({
      next: (publicaciones) => {
        this.ultimasPublicaciones = publicaciones;
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al traer las publicaciones:', err);
        this.errorPublicaciones = 'No se pudieron cargar las publicaciones recientes de este usuario.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
} 