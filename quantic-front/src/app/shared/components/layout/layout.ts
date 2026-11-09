import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [Navbar, RouterOutlet],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
})
export class Layout {}
  