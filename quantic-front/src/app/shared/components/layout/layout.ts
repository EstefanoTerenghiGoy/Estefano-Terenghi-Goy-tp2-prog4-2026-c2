import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

// Estructura de las páginas con navbar: barra arriba y la página hija abajo
@Component({
  selector: 'app-layout',
  imports: [Navbar, RouterOutlet],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
  styles: `
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 16px 48px;
    }
  `,
})
export class Layout {}
