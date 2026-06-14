import Swal from 'sweetalert2';

//Notificacion rapida
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

//errores
export const ErrorAlert = Swal.mixin({
  icon: 'error',
  confirmButtonColor: '#0d6efd', // color boton confirmar
  customClass: {
    confirmButton: 'btn btn-primary'
  },
  buttonsStyling: false
});