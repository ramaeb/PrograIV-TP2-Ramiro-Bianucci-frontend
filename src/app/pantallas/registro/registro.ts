import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toast, ErrorAlert } from '../../utils/sweetAlert';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth-service';
@Component({
  selector: 'app-registro',
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private router = inject(Router);
  private authService = inject(AuthService);
  //usuario nuevo
  nuevoUsuario: any = {
    nombre: '',
    apellido: '',
    username: '', 
    email: '',
    fechaNacimiento: '',
    descripcion: '',
    perfil: 'usuario',
    fotoPerfil: null 
  };

  clave: string = '';
  repetirClave: string = '';
  errorMsg: string = '';

  // Capturar el archivo de imagen de perfil
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
    //regex
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
    if (this.nuevoUsuario.invalid || this.clave !== this.repetirClave || !this.nuevoUsuario.imagenPerfil) {
      this.errorMsg = 'Por favor, verificá que todos los campos cumplan con los requisitos.';
      
      ErrorAlert.fire({
        icon: 'error',
        title: 'Error de validación',
        text: this.errorMsg
      });
      return; 
    }
    const formData = new FormData();
    if (!this.validarContrasenia()) {
      return;
    }
    //datos form
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
      next: (response) => {
        Toast.fire({
          icon: 'success',
          title: '¡Registro exitoso!'
        });
        // exitoso...
        console.log('Registro exitoso en backend:', response);
        
        
        
        this.router.navigate(['/login']);
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