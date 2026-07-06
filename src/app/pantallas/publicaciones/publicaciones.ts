import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PublicacionComponent } from '../publicacion/publicacion'; 
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
  ordenActual: 'fecha' | 'likes' = 'fecha'; 
  
  limite: number = 5; 
  offsetActual: number = 0; 
  hayMasPublicaciones: boolean = true; 
  cargandoHilos: boolean = false; // 🚀 Evita peticiones duplicadas simultáneas

  ngOnInit() {
    this.cargarPublicaciones();
  }

  // 🚀 ESCUCHADOR DE SCROLL INFINITO NATIVO
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Calculamos la posición del scroll con respecto al final del documento
    const posicionActual = window.innerHeight + window.scrollY;
    const alturaTotalDocumento = document.documentElement.scrollHeight;

    // Si el usuario está a menos de 200px del final, no está cargando otra tanda y hay más posts, tiramos petición
    if ((alturaTotalDocumento - posicionActual < 200) && !this.cargandoHilos && this.hayMasPublicaciones) {
      this.cargarMasPublicacionesSiguiente();
    }
  }

  cargarPublicaciones() {
    this.cargandoHilos = true;
    const url = `${this.apiUrl}?orden=${this.ordenActual}&limit=${this.limite}&offset=${this.offsetActual}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        // 🚀 Si el offset es 0 (primera carga o cambio de orden), inicializamos el array
        if (this.offsetActual === 0) {
          this.listaPublicaciones = data;
        } else {
          // 🚀 Si es scroll infinito, concatenamos los nuevos posts a los que ya teníamos
          this.listaPublicaciones = [...this.listaPublicaciones, ...data];
        }
        
        this.hayMasPublicaciones = data.length === this.limite;
        this.cargandoHilos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el feed de publicaciones:', err);
        this.cargandoHilos = false;
      }
    });
  }

  cargarMasPublicacionesSiguiente() {
    this.offsetActual += this.limite;
    this.cargarPublicaciones();
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.ordenActual !== nuevoOrden) {
      this.ordenActual = nuevoOrden;
      this.offsetActual = 0; // Reiniciamos el cursor al inicio para la nueva query
      this.listaPublicaciones = []; // Vaciamos la vista para evitar saltos raros
      this.cargarPublicaciones();
    }
  }

  // --- Tu lógica de creación se mantiene idéntica ---
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
        this.listaPublicaciones.unshift(nuevaPub); // Se agrega arriba de todo en tiempo real
        this.selectedFile = null;
        Toast.fire({ icon: 'success', title: 'Publicación creada!' });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al crear posteo:', err)
    });
  }

  removerPostDeLaVista(idEliminado: string) {
    this.listaPublicaciones = this.listaPublicaciones.filter(post => post._id !== idEliminado);
    this.cdr.detectChanges();
  }

  navegar(ruta:string){ this.router.navigate([ruta]); }
  logout() { this.authService.logout(); localStorage.clear(); }
}