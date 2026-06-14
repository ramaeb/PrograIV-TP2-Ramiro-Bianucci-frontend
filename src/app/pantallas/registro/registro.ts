import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toast, ErrorAlert } from '../../utils/sweetAlert';
import { Usuario } from '../../models/usuario';
@Component({
  selector: 'app-registro',
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private router = inject(Router);
  nuevoUsuario: Usuario = {
    nombre: '',
    tipoUsuario: '',
    apellido: '',
    edad: 0,
    email: ''
  };
  clave: string = '';
  errorMsg: string = '';
  repetirClave: string = '';

  async registrar() {
    try {
      console.log('Usuario registrado:', this.nuevoUsuario);
      Toast.fire({
        icon: 'success',
        title: 'Registro exitoso!'
      });
      this.router.navigate(['/home']);
    } catch (error:any) {
      switch (error.code) {
      case 'auth/email-already-in-use':
        this.errorMsg = 'Este correo ya está registrado. ¡Probá iniciando sesión!';
        ErrorAlert.fire({
          icon: 'error',
          title: 'Error de registro',
          text: this.errorMsg
        });
        break;
      default:
        this.errorMsg = 'Error al registrar el usuario: ' + error.message;
      }
    }
  } 
}
