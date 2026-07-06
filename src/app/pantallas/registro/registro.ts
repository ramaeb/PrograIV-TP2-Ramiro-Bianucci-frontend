import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toast, ErrorAlert } from '../../utils/sweetAlert';
import { AuthService } from '../../services/auth-service';
import { TimeTokenService } from '../../services/time-token-service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private router = inject(Router);
  private authService = inject(AuthService);
  private sessionTimer = inject(TimeTokenService);
  nuevoUsuario: any = {
    nombre: '',
    apellido: '',
    username: '', 
    email: '',
    fechaNacimiento: '',
    descripcion: '',
    perfil: 'usuario',
    imagenPerfil: null // Sincronizado con onFileSelected
  };

  clave: string = '';
  repetirClave: string = '';
  errorMsg: string = '';

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.nuevoUsuario.imagenPerfil = file;
      console.log('Imagen seleccionada:', file.name);
    }
  }

  mostrarError(mensaje: string) {
    this.errorMsg = mensaje;
    ErrorAlert.fire({
      icon: 'error',
      title: 'Validación local',
      text: this.errorMsg
    });
  }
  
  validarContrasenia(): boolean {
    const regexClave = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!this.clave) {
      this.mostrarError('Por favor, ingresá una contraseña.');
      return false;
    }

    if (!regexClave.test(this.clave)) {
      this.mostrarError('La contraseña debe poseer al menos 8 caracteres, una mayúscula y un número.');
      return false;
    }

    if (this.clave !== this.repetirClave) {
      this.mostrarError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  }

  registrar() {
    
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido || !this.nuevoUsuario.username || !this.nuevoUsuario.email) {
      this.mostrarError('Por favor, completa todos los campos obligatorios.');
      return; 
    }

    if (!this.validarContrasenia()) {
      return;
    }

    const formData = new FormData();
    
    formData.append('nombre', this.nuevoUsuario.nombre);
    formData.append('apellido', this.nuevoUsuario.apellido);
    formData.append('username', this.nuevoUsuario.username);
    formData.append('email', this.nuevoUsuario.email);
    formData.append('fechaNacimiento', this.nuevoUsuario.fechaNacimiento);
    formData.append('descripcion', this.nuevoUsuario.descripcion);
    formData.append('perfil', this.nuevoUsuario.perfil);
    formData.append('clave', this.clave); 
    
    if (this.nuevoUsuario.imagenPerfil) {
      formData.append('fotoPerfil', this.nuevoUsuario.imagenPerfil, this.nuevoUsuario.imagenPerfil.name);
    }

    this.authService.registrarUsuario(formData).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso en backend:', response);
        

        if (response.token) {
          localStorage.setItem('token', response.token);
        } else if (response.accessToken) {
          localStorage.setItem('token', response.accessToken);
        }

        const datosUsuario = response.user || response.usuario || response;
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));

        Toast.fire({
          icon: 'success',
          title: '¡Registro e inicio de sesión exitoso!'
        });
        
        
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        this.errorMsg = error.error?.message || 'Hubo un problema al conectar con el servidor.';
        
        ErrorAlert.fire({
          icon: 'error',
          title: 'Error de registro',
          text: this.errorMsg
        });
      }
    });
  }
}