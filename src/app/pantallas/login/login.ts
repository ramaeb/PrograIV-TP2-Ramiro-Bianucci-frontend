import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {App} from '../../app';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  standalone:true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email="";
  clave="";
  logearse(){}
  logearseAdmin(){}
  logearseComun(){}
}
