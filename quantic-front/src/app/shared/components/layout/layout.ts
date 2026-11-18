import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoopService, MINUTOS_AVISO } from '../../../core/services/loop.service';
import { ModalError } from '../modal-error/modal-error';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [Navbar, RouterOutlet, ModalError],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>

    @if (loop.avisoVisible()) {
      <app-modal-error
        tipo="aviso"
        [titulo]="'Quedan ' + minutosAviso + ' minutos'"
        mensaje="Tu sesión está por vencer. ¿Querés extender el loop?"
        [ocupado]="loop.extendiendo()"
        (confirmar)="loop.extender()"
        (cerrar)="loop.cerrarAviso()"
      />
    }
  `,
  styles: `
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 16px 48px;
    }
  `,
})
export class Layout implements OnInit, OnDestroy {
  loop = inject(LoopService);
  minutosAviso = MINUTOS_AVISO;

  ngOnInit(): void {
    this.loop.iniciar();
  }

  ngOnDestroy(): void {
    this.loop.detener();
  }
}
