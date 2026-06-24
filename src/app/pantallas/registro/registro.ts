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
  // Asegurate de que tu interfaz/clase Usuario incluya estos campos nuevos si es necesario
  nuevoUsuario: any = {
    nombre: '',
    apellido: '',
    username: '', 
    email: '',
    fechaNacimiento: '',
    descripcion: '',
    perfil: 'usuario',
    imagenPerfil: null 
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

  registrar() {
    // 1. Instanciamos FormData
    const formData = new FormData();

    // 2. Agregamos los datos del formulario (clave: valor)
    formData.append('nombre', this.nuevoUsuario.nombre);
    formData.append('apellido', this.nuevoUsuario.apellido);
    formData.append('username', this.nuevoUsuario.username);
    formData.append('email', this.nuevoUsuario.email);
    formData.append('fechaNacimiento', this.nuevoUsuario.fechaNacimiento);
    formData.append('descripcion', this.nuevoUsuario.descripcion);
    formData.append('perfil', this.nuevoUsuario.perfil);
    formData.append('clave', this.clave); 

    // 3. Agregamos el archivo binario si existe
    if (this.nuevoUsuario.imagenPerfil) {
      formData.append('imagenPerfil', this.nuevoUsuario.imagenPerfil, this.nuevoUsuario.imagenPerfil.name);
    }

    // 4. Llamamos al servicio y nos suscribimos al Observable
    this.authService.registrarUsuario(formData).subscribe({
      next: (response) => {
        // Entra acá si el backend responde con un HTTP Status 200 o 201
        console.log('Registro exitoso en backend:', response);
        
        Toast.fire({
          icon: 'success',
          title: '¡Registro exitoso!'
        });+
        
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // Entra acá si el backend devuelve un error (400, 404, 500, etc.)
        console.error('Error al registrar:', error);
        
        // Intentamos capturar el mensaje de error que mande tu backend en el body
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