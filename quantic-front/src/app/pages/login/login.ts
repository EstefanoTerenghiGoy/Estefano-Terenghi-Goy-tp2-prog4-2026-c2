import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { mensajeDeError } from '../../core/utils/mensaje-error';
import { BotonOjo } from '../../shared/components/boton-ojo/boton-ojo';
import { PantallaAuth } from '../../shared/components/pantalla-auth/pantalla-auth';
import { passwordValida } from '../../shared/validators/validadores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, PantallaAuth, BotonOjo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  enviando = signal(false);
  verPassword = signal(false);

  form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    password: ['', [Validators.required, passwordValida]],
  });

  invalido(campo: 'usuario' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  usuariosRapidos = environment.usuariosRapidos;

  async inicioRapido(cuenta: { usuario: string; password: string }): Promise<void> {
    this.form.setValue({ usuario: cuenta.usuario, password: cuenta.password });
    await this.enviar();
  }

  async enviar(): Promise<void> {
    if (this.form.invalid || this.enviando()) {
      return;
    }
    this.enviando.set(true);
    try {
      const { usuario, password } = this.form.getRawValue();
      const respuesta = await this.authService.login(usuario, password);
      this.authService.guardarUsuario(respuesta.usuario);
      await this.router.navigate(['/publicaciones']);
    } catch (error) {
      this.modalService.mostrarError(
        'No se pudo ingresar',
        mensajeDeError(error, 'Usuario o contraseña incorrectos.'),
      );
    } finally {
      this.enviando.set(false);
    }
  }
}
