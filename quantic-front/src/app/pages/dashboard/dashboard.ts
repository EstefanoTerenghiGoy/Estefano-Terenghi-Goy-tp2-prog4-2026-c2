import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// Encabezado común del dashboard de administrador, con sus dos secciones
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="dashboard">
      <p class="etiqueta">Panel de administración</p>
      <h1 class="titulo-pagina">Dashboard</h1>

      <nav class="secciones" aria-label="Secciones del dashboard">
        <a class="seccion" routerLink="usuarios" routerLinkActive="activa" ariaCurrentWhenActive="page">USUARIOS</a>
        <a class="seccion" routerLink="estadisticas" routerLinkActive="activa" ariaCurrentWhenActive="page">ESTADÍSTICAS</a>
      </nav>

      <router-outlet />
    </div>
  `,
  styles: `
    .dashboard {
      max-width: 1100px;
      margin: 0 auto;
    }

    .titulo-pagina {
      margin-bottom: 20px;
    }

    .secciones {
      display: inline-flex;
      margin-bottom: 24px;
      padding: 4px;
      border: 1px solid var(--borde);
      border-radius: 999px;
      background: var(--panel);
    }

    .seccion {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 0 18px;
      border-radius: 999px;
      font-family: var(--fuente-mono);
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.12em;
      color: var(--texto-suave);
      text-decoration: none;
    }

    .seccion.activa {
      background: var(--acento);
      color: #1a1206;
      font-weight: 700;
    }

    .seccion:focus-visible {
      outline: 2px solid var(--texto);
      outline-offset: 2px;
    }
  `,
})
export class Dashboard {}
