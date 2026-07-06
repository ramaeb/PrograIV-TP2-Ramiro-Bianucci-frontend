import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';
import { ErrorAlert, Toast } from '../../utils/sweetAlert';
import { FormsModule } from '@angular/forms'; 
import { CortarTextoPipe } from '../../pipes/cortar-texto-pipe';
import { ContadorCaracteresDirective } from '../../directivas/contar-caracteres';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CortarTextoPipe, ContadorCaracteresDirective, RouterModule], 
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css'
})
export class PublicacionComponent implements OnInit {
  @Input() post!: any; 
  @Output() postEliminado = new EventEmitter<string>(); 

  private http = inject(HttpClient);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/publicaciones';
  
  comentarioIdEditando: string | null = null;
  textoComentarioEditando: string = '';
  miUsuarioId: string = '';
  miUsername: string = ''; 
  yaTieneMiLike: boolean = false;
  
  mostrarComentarios: boolean = false;
  nuevoComentarioTexto: string = '';

  comentariosLimite: number = 3; 
  modalAbierto: boolean = false; 

  ngOnInit() {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal) {
      const user = JSON.parse(usuarioLocal);
      this.miUsuarioId = user._id || user.uid;
      this.miUsername = user.username; 
      
      // 🚀 CORRECCIÓN CLAVE: Buscamos adentro de la propiedad usuarioId del nuevo objeto de likes
      this.yaTieneMiLike = this.post.likes?.some((like: any) => 
        // Agregamos un fallback por si quedaron likes viejos (strings puros) en tu base de datos
        like.usuarioId === this.miUsuarioId || like === this.miUsuarioId
      );
    }
  }

  cargarMasComentarios(event: Event) {
    event.stopPropagation();
    this.comentariosLimite += 5;
    this.cdr.detectChanges();
  }

  abrirModal() {
    this.modalAbierto = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(event: Event) {
    event.stopPropagation();
    this.modalAbierto = false;
    document.body.style.overflow = 'auto';
  }

  toggleLike() {
    const url = `${this.apiUrl}/${this.post._id}/like`;
    const options = { body: { usuarioId: this.miUsuarioId } };

    if (!this.yaTieneMiLike) {
      this.http.post(url, { usuarioId: this.miUsuarioId }).subscribe({
        next: (res: any) => {
          this.post.likes = res.likes;
          this.yaTieneMiLike = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.http.delete(url, options).subscribe({
        next: (res: any) => {
          this.post.likes = res.likes;
          this.yaTieneMiLike = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  enviarComentario() {
    if (!this.nuevoComentarioTexto.trim()) return;

    const url = `${this.apiUrl}/${this.post._id}/comentario`;
    const body = {
      autorUsername: this.miUsername,
      texto: this.nuevoComentarioTexto
    };

    this.http.post(url, body).subscribe({
      next: (postActualizado: any) => {
        this.post.comentarios = postActualizado.comentarios;
        this.nuevoComentarioTexto = '';
        
        Toast.fire({
          icon: 'success',
          title: '¡Comentario publicado!'
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al comentar:', err)
    });
  }

  eliminarPosteo() {
    const options = {
      body: { 
        usuarioId: this.miUsuarioId, 
        perfil: this.authService.tipoUsuarioActual 
      }
    };

    ErrorAlert.fire({
      title: '¿Estás seguro?',
      text: "La publicación se dará de baja y no aparecerá en el feed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754', 
      cancelButtonColor: '#dc3545',  
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${this.post._id}`, options).subscribe({
          next: () => {
            Toast.fire({
              icon: 'success',
              title: '¡Publicación eliminada con éxito!'
            });
            this.postEliminado.emit(this.post._id);
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Toast.fire({
              icon: 'error',
              title: 'No se pudo eliminar la publicación.'
            });
          }
        });
      }
    });
  }

  comenzarEdicionComentario(comentario: any) {
    this.comentarioIdEditando = comentario._id;
    this.textoComentarioEditando = comentario.texto;
  }

  cancelarEdicionComentario() {
    this.comentarioIdEditando = null;
    this.textoComentarioEditando = '';
  }

  guardarComentarioEditado(comentarioId: string) {
    if (!this.textoComentarioEditando.trim()) return;

    const url = `${this.apiUrl}/${this.post._id}/comentario/${comentarioId}`;
    const body = {
      autorUsername: this.miUsername,
      nuevoTexto: this.textoComentarioEditando
    };

    this.http.put(url, body).subscribe({
      next: (postActualizado: any) => {
        this.post.comentarios = postActualizado.comentarios;
        this.cancelarEdicionComentario(); 
        
        Toast.fire({
          icon: 'success',
          title: 'Comentario editado con éxito.'
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al editar el comentario:', err)
    });
  }
}