  import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { HttpClient } from '@angular/common/http';
  import { Router } from '@angular/router';
  import { Toast, ErrorAlert } from '../../utils/sweetAlert';
import { FechaSetPipe } from '../../pipes/fecha-set-pipe';
import { PerfilNombrePipe } from '../../pipes/perfil-nombre-pipe';

  @Component({
    selector: 'app-dashboard-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, FechaSetPipe,PerfilNombrePipe],
    templateUrl: './dashboard-usuarios.html',
    styleUrls: ['./dashboard-usuarios.css']
  })
  export class DashboardUsuarios implements OnInit {
    private http = inject(HttpClient);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/api/usuarios'
    usuarios: any[] = [];
    cargandoForm: boolean = false;
    cargandoEstado: string | null = null;

    imagenSeleccionada: File | null = null;

    nuevoUsuario = {
      nombre: '',
      apellido: '',
      username: '',
      email: '',
      fechaNacimiento: '',
      descripcion: '',
      perfil: 'usuario', 
      clave: ''
    };

    ngOnInit(): void {
      this.verificarAccesoAdmin();
    }

    // Protección de ruta manual en caso de que no uses Guards aún
    private verificarAccesoAdmin(): void {
      const usuarioRaw = localStorage.getItem('usuario');
      
      if (!usuarioRaw){
        this.redireccionarAlPerfil();
        return;
      }

      try {
        const usuario = JSON.parse(usuarioRaw);
        console.log('Usuario logueado:', usuario.perfil); // Debugging
        if (usuario.perfil !== 'admin') {
          ErrorAlert.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tienes permisos de administrador para ver esta sección.'
          });
          this.redireccionarAlPerfil();
        } else {
          this.cargarUsuarios();
        }
      } catch (e) {
        this.redireccionarAlPerfil();
      }
    }

    private redireccionarAlPerfil(): void {
      localStorage.clear();
      this.router.navigate(['/mi-perfil']);
    }

    // GET: Cargar el listado total desde el backend
    cargarUsuarios(): void {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (res) => {
          this.usuarios = res;
          console.log('Usuarios cargados:', this.usuarios); // Debugging
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al traer usuarios:', err);
          Toast.fire({
            icon: 'error',
            title: 'No se pudieron cargar los usuarios.'
          });
        }
      });
    }

    // Capturar el archivo del input file
    onFileSelected(event: any): void {
      const file: File = event.target.files[0];
      if (file) {
        this.imagenSeleccionada = file;
      }
    }

    // POST: Crear usuario (Soporta Multer mediante FormData)
    crearUsuario(): void {
      this.cargandoForm = true;
      this.cdr.detectChanges();

      const formData = new FormData();
      
      // Adjuntar los campos de texto normales
      formData.append('nombre', this.nuevoUsuario.nombre);
      formData.append('apellido', this.nuevoUsuario.apellido);
      formData.append('username', this.nuevoUsuario.username);
      formData.append('email', this.nuevoUsuario.email);
      formData.append('fechaNacimiento', this.nuevoUsuario.fechaNacimiento);
      formData.append('descripcion', this.nuevoUsuario.descripcion);
      formData.append('perfil', this.nuevoUsuario.perfil);
      formData.append('clave', this.nuevoUsuario.clave);

      // Adjuntar archivo si existe
      if (this.imagenSeleccionada) {
        formData.append('imagenPerfil', this.imagenSeleccionada);
      }

      // Le pegamos al nuevo endpoint que creamos en el backend para el dashboard
      this.http.post(`${this.apiUrl}/dashboard-create`, formData).subscribe({
        next: (res) => {
          Toast.fire({
            icon: 'success',
            title: '¡Usuario creado con éxito!'
          });
          this.reseteoFormulario();
          this.cargarUsuarios(); // Recargar la tabla
        },
        error: (err) => {
          this.cargandoForm = false;
          this.cdr.detectChanges();
          ErrorAlert.fire({
            icon: 'error',
            title: 'Error al crear usuario',
            text: err.error?.message || 'Hubo un problema al procesar el registro.'
          });
        }
      });
    }

    // PATCH: Alta y Baja lógica corregida
  toggleEstado(id: string, nuevoEstado: boolean): void {
    this.cargandoEstado = id; 
    this.cdr.detectChanges(); // Forzamos cambio de estado para deshabilitar botón

    this.http.patch(`${this.apiUrl}/${id}/estado`, { activo: nuevoEstado }).subscribe({
      next: (res: any) => {
        console.log('Respuesta del cambio de estado desde Render:', res); // Debugging para revisar la BD

        const index = this.usuarios.findIndex(u => u._id === id);
        if (index !== -1) {
          this.usuarios[index].activo = nuevoEstado; 
        }
        
        Toast.fire({
          icon: 'success',
          title: nuevoEstado ? 'Usuario habilitado con éxito' : 'Usuario deshabilitado con éxito'
        });
        
        this.cargandoEstado = null;
        this.cdr.detectChanges(); // Renderiza la tabla de nuevo
      },
      error: (err) => {
        console.error('Error en el PATCH de estado:', err);
        this.cargandoEstado = null;
        this.cdr.detectChanges();
        ErrorAlert.fire({
          icon: 'error',
          title: 'Error de operación',
          text: err.error?.message || 'No se pudo cambiar el estado del usuario en el servidor.'
        });
      }
    });
  }

    private reseteoFormulario(): void {
      this.nuevoUsuario = {
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        fechaNacimiento: '',
        descripcion: '',
        perfil: 'usuario',
        clave: ''
      };
      this.imagenSeleccionada = null;
      this.cargandoForm = false;
      this.cdr.detectChanges();
    }
  }