import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PublicacionComponent } from '../publicacion/publicacion'; // Asegurá la ruta de tu componente hijo
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { Toast } from '../../utils/sweetAlert';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-publicaciones-page',
  standalone: true,
  imports: [CommonModule, PublicacionComponent],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/publicaciones';
  public authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  
  listaPublicaciones: any[] = [];
  ordenActual: 'fecha' | 'likes' = 'fecha'; // ○ Ordenado por fecha por defecto
  
  
  limite: number = 5; // Cantidad de posts por página
  offsetActual: number = 0; // Desplazamiento actual
  paginaActual: number = 1;
  hayMasPublicaciones: boolean = true; // Control para habilitar/deshabilitar el botón "Siguiente"

  ngOnInit() {
    this.cargarPublicaciones();
  }
  navegar(ruta:string){
    this.router.navigate([ruta]);
  }
  logout() {
    this.authService.logout();
    localStorage.clear();
  }
selectedFile: File | null = null;

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file;
  }
}

crearNuevaPublicacion(titulo: string, descripcion: string) {
  if (!titulo.trim() || !descripcion.trim()) {
    alert('Por favor, completa el título y la descripción.');
    return;
  }

  const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
  const miId = usuarioLocal._id || usuarioLocal.uid;
  const miUsername = usuarioLocal.username;

  const formData = new FormData();
  formData.append('titulo', titulo);
  formData.append('descripcion', descripcion);
  formData.append('usuarioId', miId);
  formData.append('autorUsuario', miUsername);
  
  if (this.selectedFile) {
    formData.append('imagen', this.selectedFile, this.selectedFile.name);
  }

  this.http.post(this.apiUrl, formData).subscribe({
    next: (nuevaPub: any) => {
      // Recargamos o agregamos al inicio del array para que aparezca al instante
      this.listaPublicaciones.unshift(nuevaPub);
      this.selectedFile = null; // Reseteamos el archivo
      Toast.fire({
                  icon: 'success',
                  title: 'Publicacion creada!'
                });
      this.cdr.detectChanges();
    },
    
    error: (err) => console.error('Error al crear posteo:', err)
  });
}
  
  cargarPublicaciones() {
    const url = `${this.apiUrl}?orden=${this.ordenActual}&limit=${this.limite}&offset=${this.offsetActual}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.listaPublicaciones = data;
        
        // Si el backend devuelve menos elementos que el límite, significa que no hay más páginas adelante
        this.hayMasPublicaciones = data.length === this.limite;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el feed de publicaciones:', err);
      }
    });
    this.cdr.detectChanges();
  }

  
  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.ordenActual !== nuevoOrden) {
      this.ordenActual = nuevoOrden;
      this.offsetActual = 0; // Al cambiar el orden, reiniciamos a la primera página
      this.paginaActual = 1;
      this.cargarPublicaciones();
    }
    this.cdr.detectChanges();
  }

  
  paginaSiguiente() {
    if (this.hayMasPublicaciones) {
      this.offsetActual += this.limite;
      this.paginaActual++;
      this.cargarPublicaciones();
    }
    this.cdr.detectChanges();
  }

  
  paginaAnterior() {
    if (this.offsetActual > 0) {
      this.offsetActual -= this.limite;
      this.paginaActual--;
      this.cargarPublicaciones();
    }
    this.cdr.detectChanges();
  }

  
  removerPostDeLaVista(idEliminado: string) {
    
    this.listaPublicaciones = this.listaPublicaciones.filter(post => post._id !== idEliminado);
    this.cdr.detectChanges();
  }
}