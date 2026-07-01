import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { PublicacionComponent } from '../publicacion/publicacion'; // Ajustá la ruta real a tu
@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil implements OnInit {
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  apiUrl = `https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/publicaciones/`;
  usuarioData: any = null;
  ultimasPublicaciones: any[] = [];
  errorPublicaciones: string = '';


  ngOnInit() {
    
    const usuarioLocalStorage = localStorage.getItem('usuario');
    if (usuarioLocalStorage) {
      this.usuarioData = JSON.parse(usuarioLocalStorage);
      
     
      this.obtenerMisPublicaciones(this.usuarioData._id);
    }
  }
  logout() {
    this.authService.logout();
    localStorage.clear();
  }
  obtenerDatosPerfilPorEmail() {
    const apiUrl = `https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/publicaciones/`;
    this.http.get<any>(`${apiUrl}email/${this.usuarioData.email}`).subscribe({
      next: (data) => {
        this.usuarioData = data;
        localStorage.setItem('usuario', JSON.stringify(data));
      },
      error: (err) => {
        console.error('Error al traer el perfil por email:', err);
     }
    });
  }
  navegar(ruta:string){
    this.router.navigate([ruta]);
  }
 obtenerMisPublicaciones(usuarioId: string) {
   
    const url = `${this.apiUrl}?usuarioId=${usuarioId}&orden=fecha&limit=3&offset=0`;
    
    this.http.get<any[]>(url).subscribe({
      next: (publicaciones) => {
        this.ultimasPublicaciones = publicaciones;
  
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al traer las publicaciones:', err);
        this.errorPublicaciones = 'No se pudieron cargar tus publicaciones recientes.';
        this.cdr.detectChanges();
      }
    });
  }
}