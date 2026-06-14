export interface Usuario {
    uid?: string; //ID FIREBASE
    email: string;
    nombre: string;
    tipoUsuario: string;
    apellido: string;
    edad: number;
    fechaRegistro?: Date;
}
